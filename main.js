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
	configuredPages = new Array() //List of pages that have been configured
	selectedChannel = ''
	lastChannel = ''
	tmpActivePages = new Array() //List of temporary pages that have been clicked (colors them before api response)
	tmpStatus = []
	tmpCounter = 0; 

	flipflop = false
	autoPreview = false
	

	constructor(internal) {
		super(internal)

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
	//  when module gets first added, all internal functions and my
	//  custom preferences will be initialized so that they can be used
	//--------------------------------------------------------------------------

	async init(config) {
		this.config = config
		//this.updateStatus(InstanceStatus.Ok)
		this.updateActions() // export actions
		this.updatePresets()// export presets
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.initCGPlus(config) // initialize
		await this.checkConnectionStatus(this.config) // check connection status
		
	}

	//--------------------------------------------------------------------------
	//  initialize connection with the CGPlus instance, needed to set an updated
	//  endpoint in the configuration
	//--------------------------------------------------------------------------

	initCGPlus = (config) => {
		this.log('initCGPlus', config)
		this.GetApi = new CGPlus(config.host, config.port)
		this.KeyPad = new Keypad()
	}

	//--------------------------------------------------------------------------
	//  Check if connection to endpoint is valid, if it's valid, will start
	//  Status clock and will keep everything up to date, if not then status
	//  is set to show an Error message, this will show the user that the connection
	//  is invalid
	//--------------------------------------------------------------------------

	async checkConnectionStatus(config) {
		this.log('checkConnectionStatus');
	
		let res = await this.GetApi.Connect();
	
		console.log('res', res);
	
		if (res) {
			let channels = await this.GetApi.GetChannels();
	
			if (this.checkIfChannelIsActive(channels, "Channel " + config.channel)) {
				this.selectedChannel = "Channel " + config.channel;
				this.log('CONNECTION SUCCESSFUL');
				this.updateStatus(InstanceStatus.Ok);
	
				 // Move the declaration inside the method
	
				this.createclock = setInterval(async () => {
					//console.log("Before tmpCounter increment:", this.tmpCounter);
				
					if (this.tmpCounter < 6) {
						this.tmpCounter += 1;
						
					} else {
						this.tmpCounter = 0;
						this.tmpActivePages = [];
					}
				
					//console.log("After tmpCounter increment:", this.tmpCounter);
				
					await this.setOnAirStatus();
					this.flipflop = await this.GetApi.GetFlipFlop()
					this.autoPreview = await this.GetApi.GetTagsAutoPreview()
					//console.log("FlipFlop is Active?  ->",this.flipflop)
					//console.log("AutoPreview is Active?  ->",this.autoPreview)

				}, 300);
	
				this.createFeedClock = setInterval(async () => {
					this.feedChecker();
				}, 100);

				this.createConfiguredChannelsClock = setInterval(async () => {
					await this.setConfiguredPages()
				}, 5000);

			} else {
				this.log('error', 'no connection');
				this.updateStatus(InstanceStatus.UnknownError);
			}
		} else {
			this.log('error', 'no connection');
			this.updateStatus(InstanceStatus.UnknownError);
		}
	}
	

	//--------------------------------------------------------------------------
	//  Function calledto compare new status with savede status
	//--------------------------------------------------------------------------

	CompareStatus(arr1, arr2) {
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
	//  Function called inside clock, will call status api and will save on air
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
	//  this permits the user to easily 
	//--------------------------------------------------------------------------
	
	isPreview() {
		
		if(this.selectedChannel!="Preview"){

			return false

		}else{
			
			return true
		}

	}

	//--------------------------------------------------------------------------
	//  toggles beetween last channel and preview (basically a toggle) and 
	//  this permits the user to easily 
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
	// returns pagetype (single multi)
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

		let type = this.pageType(searchString)
		let status = [...this.onAirStatus]

		//let tmpActive = this.tmpActivePages

		if(this.tmpActivePages.length>0 && this.tmpActivePages.includes(searchString)){
			return true
		}

		for (const obj of status) {

			if(type == "Number"){

				if (obj.Name === ('Page' +searchString)) {
					return true
				}

			}else if(type == "Character"){

				if (obj.Index === searchString) {
					return true
				}
			}
		}
		return false
	}

	//--------------------------------------------------------------------------
	//  Function checks if Page is set on the cgplus client side
	//  will be used to color the button or other customizations
	//--------------------------------------------------------------------------

	async isPageSet(searchString) {

		let type = this.pageType(searchString)

		let objectArray = this.configuredPages

		for (const obj of objectArray) {

			if(type == "Number"){

				if (obj.Index === (searchString.toString())) {

					var pageObjects 
					
					if(this.isPreview()){
						pageObjects =await this.GetApi.GetPageObjects(this.lastChannel,obj.Name)
					}else{
						pageObjects =await this.GetApi.GetPageObjects(this.selectedChannel,obj.Name)
					}
					//console.log("pageName: " + obj.Name)
					if(pageObjects.length>0){
						return true
					}else{
						return false
					}
					
				}

			}else if(type == "Character"){

				if (obj.Index === searchString) {

					var pageObjects 

					if(this.isPreview()){
						pageObjects =await this.GetApi.GetPageObjects(this.lastChannel,obj.Name)
					}else{
						pageObjects =await this.GetApi.GetPageObjects(this.selectedChannel,obj.Name)
					}

					if(pageObjects.length>0){
						return true
					}else{
						return false
					}

				}
			}
		}
		return false
	}

	//--------------------------------------------------------------------------
	//  When module gets deleted, cleanup
	//--------------------------------------------------------------------------

	async destroy() {
		this.log('debug', 'destroy')
		clearInterval(this.createClock)
		clearInterval(this.createFeedClock)
		clearInterval(this.createConfiguredChannelsClock)
	}

	//--------------------------------------------------------------------------
	//  When Config is updated (Reinitialization of api class (Endpoint Changes))
	//--------------------------------------------------------------------------

	async configUpdated(config) {
		
		//console.log('CONFIGS !!! UPDATED', this.config)
		this.config = config
		console.log('CONFIGS UPDATED', this.config)
		this.initCGPlus(config)
		await this.checkConnectionStatus(config) // check connection status
		this.updateActions() // export actions
		this.updatePresets()// export presets
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}

	

	//--------------------------------------------------------------------------

	updateActions() {
		UpdateActions(this)
	}

	//--------------------------------------------------------------------------

	updatePresets(){
		UpdatePresets(this)
	}

	//--------------------------------------------------------------------------

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	//--------------------------------------------------------------------------

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}

	//--------------------------------------------------------------------------
}

runEntrypoint(CGPlusModule, UpgradeScripts)
