const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./src/upgrades')
const UpdateActions = require('./src/actions')
const UpdateFeedbacks = require('./src/feedbacks')
const UpdateVariableDefinitions = require('./src/variables')
const UpdatePresets = require('./src/presets')

const CGPlus = require('./src/custom_classes/cgplus')
const Keypad = require('./src/custom_classes/keypad')

class CGPlusModule extends InstanceBase {

	//value used in the keypad reset timeout, used to prevent multiple timeouts to be created
	interval = 0
	configuredPages = new Array([]) //List of pages that have been configured
	selectedChannel = ''
	lastChannel = ''
	tmpActivePages = new Array([]) //List of temporary pages that have been clicked (colors them before api response)
	tmpStatus = []
	tmpCounter = 0; 
	GetApi = null;
	flipflop = false;
	autoPreview = false;
	isConnected = false;
	isFirstConnection = true;


	constructor(internal) {
		super(internal)

		this.GetApi = null;
		this.onAirStatus = []

		//assign const variables to the class, this way you can use their function/classes whit this.VARIABLE/FUNCTION
		Object.assign(this, {
			...Keypad,
			...UpdateActions,
			...UpdatePresets,
			...UpdateFeedbacks,
			...UpdateVariableDefinitions,
		})
	}

	//--------------------------------------------------------------------------
	//  Return config fields for web config (Only 2 Fields: [ ip, port])
	//--------------------------------------------------------------------------

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 8,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				regex: Regex.PORT,
			},
			{
				type: 'number',
				id: 'channel',
				label: 'Channel Number',
				width: 12,
			}
		]
	}

	//--------------------------------------------------------------------------
	//  This function manages the logging, since we cant use this.log elsewhere
	//  we'll have to pass this function as callback to custom elements
	//  (i hope this is the right way ^^)
	//--------------------------------------------------------------------------

	LogManager = (eType, message) => {
		try
		 {
			if (eType === 'error' || eType === 'warn' || eType === 'info' || eType === 'debug')
			{
				this.log(eType, message);
			} 
			else 
			{
				console.error('Unknown log type:', eType);
			}
		} 
		catch (error) 
		{
			console.error('Error in LogManager:', error);
		}
	}

	//--------------------------------------------------------------------------
	//  when module gets first added, all internal functions and my
	//  custom preferences will be initialized so that they can be used
	//--------------------------------------------------------------------------

	async init(config) {
		this.config = config;
		this.updateActions(); // export actions
		this.updatePresets(); // export presets
		this.updateFeedbacks(); // export feedbacks
		this.updateVariableDefinitions(); // export variable definitions
		await this.initCGPlus(config); // initialize
		this.configuredPages = []; // Initialize configuredPages as an empty array
	}

	//--------------------------------------------------------------------------
	//  initialize connection with the CGPlus instance, needed to set an updated
	//  endpoint in the configuration
	//--------------------------------------------------------------------------

	initCGPlus = async (config) => 
	{

		if(config.host != '' && config.port != '' && config.channel != '')
		{
			this.GetApi = new CGPlus(config.host, config.port,this.LogManager)
			this.KeyPad = new Keypad()
			this.updateStatus(InstanceStatus.Connecting);
			await this.checkConnectionStatus(config)
		}
		else
		{
			//console.log("CONFIGS:",config)
			this.updateStatus(InstanceStatus.ConnectionFailure);
			this.LogManager("warn","Missing configuration for the module")
		}
	}

	//--------------------------------------------------------------------------
	//  Check if connection to endpoint is valid, if it's valid, will start
	//  Status clock and will keep everything up to date, if not then status
	//  is set to show an Error message, this will show the user that the connection
	//  is invalid
	//--------------------------------------------------------------------------

	async checkConnectionStatus(config) {
		this.selectedChannel = "Channel " + config.channel;
	
		const connectAndSetup = async () => {
			try {
				const isConnected = await this.connectionManager();
				if (isConnected) {
					const channels = await this.GetApi.GetChannels();
					if (channels != null && this.checkIfChannelIsActive(channels, "Channel " + config.channel)) {
						this.LogManager('info', 'CONNECTION SUCCESSFUL');
						this.updateStatus(InstanceStatus.Ok);
						this.setupIntervals();
					} else {
						this.LogManager('error', 'Connection failed');
						this.updateStatus(InstanceStatus.ConnectionFailure);
						clearInterval(this.connectionManagerClock); // Clear the connection interval
					}
				} else {
					this.LogManager('error', 'Connection failed. Retrying...');
					this.updateStatus(InstanceStatus.ConnectionFailure);
					clearInterval(this.connectionManagerClock); // Clear the connection interval
					setTimeout(connectAndSetup, 5000); // Retry after 5 seconds
				}
			} catch (error) {
				this.LogManager('error', 'Error during connection attempt: ' + error);
				this.clearIntervals();
				setTimeout(connectAndSetup, 5000); // Retry after 5 seconds
			}
		};
	
		connectAndSetup();
	
		// Set up interval for connection management
		this.connectionManagerClock = setInterval(connectAndSetup, 5000);
	}
	
	async connectionManager() {
		try {
			const res = await this.GetApi.Connect();
			this.LogManager('info', 'Connection status: ' + res);
			return res;
		} catch (error) {
			this.LogManager('error', 'API connection error: ' + error);
			return false;
		}
	}
	
	setupIntervals() {
		// Clear existing intervals if any
		this.clearIntervals();
	
		// Set up intervals for various tasks
		this.createclock = setInterval(async () => {
			if (this.tmpCounter < 6) {
				this.tmpCounter += 1;
			} else {
				this.tmpCounter = 0;
				this.tmpActivePages = [];
			}
	
			await this.setOnAirStatus();
			this.flipflop = await this.GetApi.GetFlipFlop();
			this.autoPreview = await this.GetApi.GetTagsAutoPreview();
		}, 500);
	
		this.createFeedClock = setInterval(async () => {
			this.feedChecker();
		}, 100);
	
		this.createConfiguredChannelsClock = setInterval(async () => {
			await this.setConfiguredPages();
		}, 5000);
	
		// Check connection status periodically
		this.connectionStatusCheckClock = setInterval(async () => {
			const isConnected = await this.connectionManager();
			if (!isConnected) {
				this.LogManager('error', 'Disconnected. Attempting to reconnect...');
				clearInterval(this.createclock);
				clearInterval(this.createFeedClock);
				clearInterval(this.createConfiguredChannelsClock);
				clearInterval(this.connectionStatusCheckClock); // Stop checking connection status
				this.checkConnectionStatus(this.config); // Attempt reconnection
			}
		}, 10000); // Check connection status every 10 seconds
	}
	
	clearIntervals() {
		clearInterval(this.createclock);
		clearInterval(this.createFeedClock);
		clearInterval(this.createConfiguredChannelsClock);
		clearInterval(this.connectionStatusCheckClock);
	}

	//--------------------------------------------------------------------------
	//  Function calledto compare new status with savede status
	//--------------------------------------------------------------------------

	CompareStatus(arr1, arr2) {
		// Check if arr1 and arr2 are arrays
		if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
			return false;
		}
	
		// Check if the lengths are different
		if (arr1.length !== arr2.length) {
			return false;
		}
	
		// Deep comparison of array elements
		for (let i = 0; i < arr1.length; i++) {
			const obj1 = arr1[i];
			const obj2 = arr2[i];
	
			// Customize this condition based on your comparison criteria
			if (!this.isObjectEqual(obj1, obj2)) {
				return true;
			}
		}
	
		return false;
	}
	
	// Example: Deep comparison of two objects
	isObjectEqual(obj1, obj2) {
		// Customize this function based on your comparison criteria
		return JSON.stringify(obj1) === JSON.stringify(obj2);
	}

	//--------------------------------------------------------------------------
	//  Polling Function, will call status api and will save on air
	//  pages, this data will then be use by feedbacks and actions (keep all responsive)
	//--------------------------------------------------------------------------
	
	async setOnAirStatus() {

		if(this.isPreview()){

			let res = await this.GetApi.GetPreviewOnAirStatus()
			// console.log("onAirStatus PRW",this.onAirStatus)
			// console.log("onAirStatus  res PRW", await this.GetApi.GetPreviewOnAirStatus())
			// console.log("tmpActivePages PRW",this.tmpActivePages)

			if(res && this.CompareStatus(this.onAirStatus,res)){
				
				this.tmpActivePages = []
				
			}
			this.onAirStatus = await res
			//console.log("preview on air status")

		}else{

			let res = await this.GetApi.GetOnAirStatus(this.selectedChannel);
			//console.log("setOnAirStatus",res)
			//console.log("onAirStatus",this.onAirStatus)

			if(res && this.CompareStatus(this.onAirStatus,res)){
			
				this.tmpActivePages = []
				
			}
			this.onAirStatus = await res
		}
		
	}

	//--------------------------------------------------------------------------
	// This function will return all the pages that have a defined configuration
	// and they'll be used for feedback and action purpouses
	//--------------------------------------------------------------------------

	async setConfiguredPages() {

		let res = await this.GetApi.GetPages(this.config.channel);
		//console.log("Configured pages:",res);
		this.configuredPages = res;
		
	}

	//--------------------------------------------------------------------------
	// This function will return description of the pages that have a defined configuration
	//--------------------------------------------------------------------------

	getConfiguredPageDescription(index) {

		if(this.configuredPages.length > 0){

			for(const page of this.configuredPages){

				if(page.Index == index){
					return  page.Description;
				}
			}
		}
		return ""
	}

	//--------------------------------------------------------------------------
	// Function that simply updates the feedback status of the buttons 
	//--------------------------------------------------------------------------
	
	feedChecker() {

		this.setVariableValues({
			'CTP': this.KeyPad.ClipToPlay
		})
		this.checkFeedbacks('page_to_launch');
		this.checkFeedbacks('page_is_on_air')
		this.checkFeedbacks('program_is_selected')
		this.checkFeedbacks('preview_is_selected')
		this.checkFeedbacks('isBlank')
		this.checkFeedbacks('isClear')
		this.checkFeedbacks('flip_flop')
		this.checkFeedbacks('auto_preview')

	}
	
	//--------------------------------------------------------------------------
	//  toggles beetween last channel and preview (basically a toggle) and 
	//  this permits the user to easily 
	//--------------------------------------------------------------------------
	
	setPrw() {

		if(this.isPreview()==false) {
			this.lastChannel = this.selectedChannel;
			this.selectedChannel = 'Preview';
		}

	}
	//--------------------------------------------------------------------------
	setPrg() {

		if(this.isPreview()) {

			this.selectedChannel = this.lastChannel;
			this.lastChannel ='';
		}
	}

	//--------------------------------------------------------------------------
	//  toggles beetween last channel and preview (basically a toggle) and 
	//  this permits the user to easily switch between them
	//--------------------------------------------------------------------------
	
	isPreview() {
		
		if(this.selectedChannel!="Preview"){

			return false

		}else{
			
			return true
		}

	}

	//--------------------------------------------------------------------------
	// Returns wether the preview or the program are blank (no page On Air)
	// idk why only the program has a blank object when empty while the prw doesn't
	// wont ask questions about it :|
	//--------------------------------------------------------------------------
	
	isBlank() {
		if(this.isPreview()){

			return this.onAirStatus.length === 0 || !this.onAirStatus.some(obj => obj.Index > 0 && obj.Index <= 99);

		}else{

			return this.onAirStatus.length === 0 || this.onAirStatus.some(obj => obj.Name === "Blank");

		}
	}

	//--------------------------------------------------------------------------

	isClear() {
			
		return this.onAirStatus.length === 0 || !this.onAirStatus.some(obj => /[a-zA-Z]/.test(obj.Index));

	}

	//--------------------------------------------------------------------------
	//  Return channels with the active flag (active channel that can go on air)
	//--------------------------------------------------------------------------

	checkIfChannelIsActive(channels,channelName) {
		
		for(var i = 0; i < channels.length; i++){

			if(channels[i].Name == channelName){

				if(channels[i].Active){
					return true
				}else{
					return false
				}
			}
		}

	}

	//--------------------------------------------------------------------------
	// returns pagetype (single/multi)
	//--------------------------------------------------------------------------

	pageType(string){
		let type = ''

		if (!isNaN(string)) {
			
			type = 'Number';

		} else if (string.length === 1 && string.match(/[a-zA-Z]/)) {

			type = 'Character';

		}

		return type
	}

	//--------------------------------------------------------------------------
	//  Function checks if Page is currently active (used in actions or feedbacks)
	//  will be used to color the button or other customizations
	//--------------------------------------------------------------------------

	isPageActive(searchString) {
		let type = this.pageType(searchString);
		let status = Array.isArray(this.onAirStatus) ? [...this.onAirStatus] : [];
	
		// Check if the page is active in temporary pages
		if (this.tmpActivePages.length > 0 && this.tmpActivePages.includes(searchString)) {
			return true;
		}
	
		for (const obj of status) {
			if (type === "Number") {
				if (obj.Name === ('Page' + searchString)) {
					return true;
				}
			} else if (type === "Character") {
				if (obj.Index === searchString) {
					return true;
				}
			}
		}
	
		return false;
	}

	//--------------------------------------------------------------------------
	//  Function checks if Page is set on the cgplus client side
	//  will be used to color the button or other customizations
	//--------------------------------------------------------------------------

	async isPageSet(searchString) {
		let type = this.pageType(searchString);
		let objectArray = this.configuredPages;
	
		// Check if objectArray is iterable
		if (!Array.isArray(objectArray)) {
			//console.error('configuredPages is not an array:', objectArray);
			return false;
		}
	
		for (const obj of objectArray) {
			if (type === "Number" && obj.Index === searchString.toString()) {
				const pageObjects = await this.getPageObjects(obj.Name);
				return pageObjects?.length > 0;
			} else if (type === "Character" && obj.Index === searchString) {
				const pageObjects = await this.getPageObjects(obj.Name);
				return pageObjects?.length > 0;
			}
		}
		
		return false;
	}
	
	async getPageObjects(pageName) {
		const channel = this.isPreview() ? this.lastChannel : this.selectedChannel;
		return await this.GetApi.GetPageObjects(channel, pageName);
	}

	//--------------------------------------------------------------------------
	//  When module gets deleted, cleanup
	//--------------------------------------------------------------------------

	async destroy() 
	{
		this.LogManager('error', 'destroy')
		clearInterval(this.createClock)
		clearInterval(this.createFeedClock)
		clearInterval(this.createConfiguredChannelsClock)
		clearInterval(this.connectionManagerClock)
	}

	//--------------------------------------------------------------------------
	//  When Config is updated (Reinitialization of api class (Endpoint Changes))
	//--------------------------------------------------------------------------

	async configUpdated(config) 
	{
		this.config = config
		//console.log('CONFIGS UPDATED', this.config)
		this.initCGPlus(config)
		await this.checkConnectionStatus(config) // check connection status
		this.updateActions() // export actions
		this.updatePresets()// export presets
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}

	//--------------------------------------------------------------------------

	updateActions() 
	{
		UpdateActions(this)
	}

	//--------------------------------------------------------------------------

	updatePresets()
	{
		UpdatePresets(this)
	}

	//--------------------------------------------------------------------------

	updateFeedbacks() 
	{
		UpdateFeedbacks(this)
	}

	//--------------------------------------------------------------------------

	updateVariableDefinitions() 
	{
		UpdateVariableDefinitions(this)
	}


	//--------------------------------------------------------------------------
}

runEntrypoint(CGPlusModule, UpgradeScripts)
