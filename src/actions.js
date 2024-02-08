/**/
module.exports = function (instance) {
	instance.setActionDefinitions({
		//----------------------------------------------------------------
		Keypress: {
			name: 'Keypad keypress',
			options: [
				{
					id: 'NumChoise',
					type: 'number',
					label: 'Page Number',
					default: 1,
				},
			],
			callback: async (event) => {
				try {

					instance.KeyPad.keypress(event.options.NumChoise)
					if (instance.interval == 0) {
						instance.ClipTM = setTimeout(function () { instance.KeyPad.reset(), instance.interval= 0 }.bind(instance), 3000)
						instance.interval =1 
					}

				} catch (e) {
					console.log('error', e)
				}
			},
		},
		Launch_keypress: {
			name: 'Launch page digited on keypad',

			callback: async (event) => {
				try {

					if(instance.isPreview()) {

						if (!instance.isPageActive(instance.KeyPad.ClipToPlay)) {

							result = await instance.GetApi.TakePageOnPreview(instance.lastChannel,instance.KeyPad.ClipToPlay)

						} 

					}else{

						if (!instance.isPageActive(instance.KeyPad.ClipToPlay)) {

							result = await instance.GetApi.TakePage(instance.selectedChannel,instance.KeyPad.ClipToPlay)
						}

					}
					instance.KeyPad.reset()
					//clearTimeout(instance.ClipTM)

				} catch (e) {
					console.log('error', e)
				}
			},
		},
		//----------------------------------------------------------------|
		// This action is based on the selected channel, it manages       |
		// single and multi pages, and manages preview as well            |
		// the user need the channel selection buttons as well to make    |
		// it work properly                                               |
		//----------------------------------------------------------------|
		Take_Page: {
			name: 'Take Page',
			options: [
				{
					id: 'num',
					type: 'textinput',
					label: 'Page Number',
					default: 1,
				},
			],
			callback: async (event) => {
				try {
					
					if(instance.isPreview()) {

						if (instance.isPageActive(event.options.num)) {

							if(event.options.num.length === 1 && event.options.num.match(/[a-zA-Z]/)){

								result = await instance.GetApi.TakePageOnPreview(instance.lastChannel, event.options.num)
								instance.tmpActivePages.splice(event.options.num)
							}

						} else {
							
							let type = instance.pageType(event.options.num)

							if(type == "Number"){

								instance.tmpActivePages =[event.options.num]
								
							}else{
								instance.tmpActivePages.push(event.options.num)
							}
							instance.tmpCounter = 0;
							result = await instance.GetApi.TakePageOnPreview(instance.lastChannel, event.options.num)
						}

					}else{

						if (instance.isPageActive(event.options.num)) {

							if(event.options.num.length === 1 && event.options.num.match(/[a-zA-Z]/)){
								result = await instance.GetApi.TakePage(instance.selectedChannel, event.options.num)
								instance.tmpActivePages.splice(event.options.num)
							}

						} else {
							
							let type = instance.pageType(event.options.num)

							if(type == "Number"){

								instance.tmpActivePages =[event.options.num]
								
							}else{
								instance.tmpActivePages.push(event.options.num)
							}
							instance.tmpCounter = 0;
							result = await instance.GetApi.TakePage(instance.selectedChannel, event.options.num)
						}

					}

				} catch (e) {
					console.log('error', e)
				}
			},
		},
		//----------------------------------------------------------------
		Blank: {
			name: 'Blank single pages based on selected channel (Preview included)',

			callback: async (event) => {
				try {

					if(instance.isPreview()) {
						
						result = await instance.GetApi.TakeBlankPageOnPreview()
						//console.log('debug', result)

					}else{

						result = await instance.GetApi.TakeBlankPage(instance.selectedChannel)
						//console.log('debug', result)

					}

				} catch (e) {
					console.log('error', e)
				}
			},
		},
		//----------------------------------------------------------------
		Clear: {
			name: 'Clear multi pages on Air',

			callback: async (event) => {
				try {

					if(instance.isPreview()) {
						
						result = await instance.GetApi.ClearAllMultiPagesOnPreview()
						//console.log('debug', result)
						
					}else{

						result = await instance.GetApi.ClearAllMultiPages(instance.selectedChannel)
						//console.log('debug', result)
					}
					instance.tmpActivePages = []

				} catch (e) {
					console.log('error', e)
				}
			},
		},
		//----------------------------------------------------------------
		Set_PRW: {
			name: 'Set the working channel to preview',

			callback: async () => {
				instance.setPrw()
			},
		},
		//----------------------------------------------------------------
		Set_PRG: {
			name: 'Set the working channel to the selected Channel',

			callback: async () => {
				instance.setPrg()
			},
		},
		//----------------------------------------------------------------
		Press_Tags_Take_Preview:{
			name: 'Press Tags Take Preview',

			callback: async () => {
				await instance.GetApi.PressTagsTakePreview()
			},
		},
		//----------------------------------------------------------------
		Press_Tags_Take_Program:{
			name: 'Press Tags Take Program',

			callback: async () => {
				await instance.GetApi.PressTagsTakeProgram()
			},
		},
		//----------------------------------------------------------------
		Press_Take_Program:{
			name: 'Press_Take_Program',

			callback: async () => {
				await instance.GetApi.PressTakeProgram()
			},
		},
		//----------------------------------------------------------------
		Set_Flip_Flop:{
			name: 'Set_Flip_Flop',

			callback: async () => {
				await instance.GetApi.SetFlipFlop(!instance.flipflop)
			},
		},
		//----------------------------------------------------------------
		Set_Tags_Auto_Preview:{
			name: 'Set_Tags_Auto_Preview',

			callback: async () => {
				await instance.GetApi.SetTagsAutoPreview(!instance.autoPreview)
			},
		},
		
	})
	//----------------------------------------------------------------
}
/**/