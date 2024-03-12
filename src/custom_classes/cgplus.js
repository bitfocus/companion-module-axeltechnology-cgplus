/**/
let fetch
import('node-fetch').then((module) => {
	fetch = module.default
})

//variables used to build the api request link
let url
let urlSuffix = 'http://'
let format = 'format=json'
//----------------------------------------------------------------------------------------------------
//Class used to work whit the cg-plus api's
//----------------------------------------------------------------------------------------------------

class CGPlus {

	//------------------------------------------------------------------------------------------------
	//  the constructor uses the Ip, and url port specified by the user to build the
	//  endpoint
	//------------------------------------------------------------------------------------------------

	constructor(CGPlusIp, CGPlusPort, LogManager) 
	{
		this.CGPlusIp = CGPlusIp;
		this.CGPlusPort = CGPlusPort;
		this.LogManager = LogManager;
		//On construction we check if we have a configuration (we'll call log if not for feedback)
		//console.log("CGPlusIp", CGPlusIp);
		//console.log("CGPlusPort", CGPlusPort);
	
		if (CGPlusIp !== null && CGPlusIp !== undefined && CGPlusPort !== null && CGPlusPort !== undefined && CGPlusIp !== '' && CGPlusPort !== '') {
			// Construct the URL only if both IP and Port are not empty or null
			this.CGPlusUrl = urlSuffix + CGPlusIp + ':' + CGPlusPort + '/CGPlus';
		} else {
			// Log a warning if either IP or Port is empty or null
			this.LogManager('warn', 'Incomplete configuration: IP or Port is missing');
		}   
	}

	//------------------------------------------------------------------------------------------------
	//  function made to generate the endpoint url, since most of the url are the same for all api's
	//------------------------------------------------------------------------------------------------

	getUrl(api, type) 
	{
		if (type == 'data_p') 
		{
			return (url = this.CGPlusUrl + '/REST/' + api + '&' + format)
		} 
		else if (type == 'data_no_p') 
		{
			return (url = this.CGPlusUrl + '/REST/' + api + '?' + format)
		} 
		else if (type == 'command') 
		{
			return (url = this.CGPlusUrl + '/REST/' + api)
		}
		else if (type == "UI")
		{
			return (url = this.CGPlusUrl + '/REST/UI/' + api)
		}
		else if (type == "UI_D")
		{
			return (url = this.CGPlusUrl + '/REST/UI/' + api+ '?' + format)
		}
	}

	//------------------------------------------------------------------------------------------------
	//  Fetch Api manager function, we implement this to handle all the fetch request and stop
	//  them if necessary
	//------------------------------------------------------------------------------------------------

	ExecuteRequest = async (url, toJson) => {

		// Default toJson value to true if not provided
		const returnJson = toJson !== undefined ? toJson : false;
	
		// Here we check if we got the configuration
		if (this.CGPlusIp && this.CGPlusPort ) {
			try {
				const res = await fetch(url);
	
				if (res.ok) {
					// Return JSON data on success if returnJson is true
					if (returnJson) {
						return await res.json();
					} else {
						return res; // Return the entire response object
					}
				} else {
					// Log an error on failure
					this.LogManager('error', 'Error fetching data from server:' + res.statusText);
				}
			} catch (err) {
				// Handle network error
				this.LogManager('error', 'Network error occurred:' + err.message);
			}
		} else {
			// No configuration
			this.LogManager('warn', 'No configuration');
		}
	
		// Return null if there is no data to return
		return null;
	}


	//------------------------------------------------------------------------------------------------
	//  function called when we initilialize the module, since the dynamic
	//  import of node-fetch might not have completed before the Connect method is called.
	//------------------------------------------------------------------------------------------------

	async loadFetch() {
		if (!fetch) {
			const module = await import('node-fetch')
			fetch = module.default
		}
	}

	//------------------------------------------------------------------------------------------------
	//  function called in the init and config update, it will try to connect to a default api to see
	//  if a connection is extablished, if not return error that machine wasn't reached
	//------------------------------------------------------------------------------------------------

	Connect = async () => 
	{
		await this.loadFetch()
		//this.debug('debug', 'CONNECT')
		url = this.getUrl('IsAlive', 'data_no_p')
		
		try
		{
			const response = await this.ExecuteRequest(url,false)

			if (response) 
			{
				this.LogManager('info', 'successful CG connection');
				return true
			} 
			else 
			{
				this.LogManager('warn', 'rejected CG connection');
			}
		}
		catch (err) 
		{
			this.LogManager('error', 'Error in Connect:', err.message);
			return false
		}
	}

	//------------------------------------------------------------------------------------------------
	//  API USED IN ACTIONS
	//------------------------------------------------------------------------------------------------

	//function takes multi and single pages on air
	TakePage = async (channelName, pageName) => {
		url = this.getUrl('TakePage?ChannelName=' + channelName + '&PageName=' + pageName, 'command')
		await fetch(url)
	}

	//blank page for single pages
	TakeBlankPage = async (channelName) => {
		url = this.getUrl('TakeBlankPage?ChannelName=' + channelName, 'command')
		await fetch(url)
	}
	
	//blank page for single pages on preview
	TakeBlankPageOnPreview = async () => {
		url = this.getUrl('TakeBlankPageOnPreview', 'command')
		await fetch(url)
	}

	//function takes multi and single pages on preview
	TakePageOnPreview = async (channelName, pageName) => {
		url = this.getUrl('TakePageOnPreview?ChannelName=' + channelName + '&PageName=' + pageName, 'command')
		await fetch(url)
	}

	//function clear all lettered pages on preview
	ClearAllMultiPagesOnPreview = async () => {
		url = this.getUrl('ClearAllMultiPagesOnPreview', 'command')
		await fetch(url)
	}

	//function clear all lettered pages
	ClearAllMultiPages = async (channelName) => {
		url = this.getUrl('ClearAllMultiPages?ChannelName=' + channelName, 'command')
		await fetch(url)
	}

	//function that clears single multi page onAir
	ClearMultiPage = async (channelName, pageName) => {
		url = this.getUrl('ClearMultiPage?ChannelName=' + channelName + '&PageName=' + pageName, 'command')
		await fetch(url)
	}

	//function clear all numbered pages
	clearAllPages = async (channelName) => {
		url = this.getUrl('ClearAllPages?ChannelName=' + channelName, 'command')
		await fetch(url)
	}

	//------------------------------------------------------------------------------------------------
	//  Api used to get information and data needed for different purposes
	//------------------------------------------------------------------------------------------------

	//function get all channels
	GetChannels = async () => {
		url = this.getUrl('GetChannels', 'data_no_p')
		const response = await fetch(url)
		return response.json()
	}

	//function get all pages
	GetPages = async (channelName) => {
		url = this.getUrl('GetPages?ChannelName=' + channelName, 'data_p')
		const response = await fetch(url)
		return response.json()
	}

	//function get all onAir pages
	GetOnAirStatus = async (channelName) => {
		url = this.getUrl('GetOnAirStatus?ChannelName=' + channelName, 'data_p')
		const response = await fetch(url)
		return response.json()
	}

	//function get all onAir pages
	GetPreviewOnAirStatus = async () => {
		url = this.getUrl('GetPreviewOnAirStatus', 'data_no_p')
		const response = await fetch(url)
		return response.json()
	}

	//
	GetFlipFlop = async () => {
		url = this.getUrl('GetFlipFlop', 'UI_D')
		const response = await fetch(url)
		return response.json()
	}

	//
	GetTagsAutoPreview = async () => {
		url = this.getUrl('GetTagsAutoPreview', 'UI_D')
		const response = await fetch(url)
		return response.json()
	}
	
	//
	GetPageObjects= async (channelName,PageName) => {
		url = this.getUrl('GetPageObjects?ChannelName=' + channelName+'&PageName='+PageName, 'data_p')
		const response = await fetch(url)
		return response.json()
	}

	//------------------------------------------------------------------------------------------------
	//  Ui commands 
	//------------------------------------------------------------------------------------------------

	PressTagsTakePreview = async () => {
		url = this.getUrl('PressTagsTakePreview', 'UI')
		const response = await fetch(url)
		return response.json()
	}

	PressTagsTakeProgram = async () => {
		url = this.getUrl('PressTagsTakeProgram', 'UI')
		const response = await fetch(url)
		return response.json()
	}

	PressTakeProgram = async () => {
		url = this.getUrl('PressTakeProgram', 'UI')
		const response = await fetch(url)
		return response.json()
	}

	SetFlipFlop = async (active) => {
		console.log("SetFlipFlop ->",active)

		url = this.getUrl('SetFlipFlop?active='+active, 'UI')
		const response = await fetch(url)
		return response.json()
	}

	SetTagsAutoPreview = async (active) => {
		console.log("AUTOPREW ->",active)
		url = this.getUrl('SetTagsAutoPreview?active='+active, 'UI')
		const response = await fetch(url)
		return response.json()
	}
}
//----------------------------------------------------------------------------------------------------
module.exports = CGPlus

/**/
