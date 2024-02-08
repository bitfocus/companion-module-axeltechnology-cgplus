const { combineRgb } = require('@companion-module/base')

module.exports = async function (self) {
	self.setFeedbackDefinitions({
		page_is_on_air: {
			name: 'Page is on air',
			type: 'advanced',
			label: 'Channel State',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'num',
					type: 'textinput',
					label: 'Page Identification',
					default: 1,
				},
				{
					id: 'unset_color',
					type: 'colorpicker',
					label: 'Unset Color',
					default: combineRgb(182, 182, 182),
				},
				{
					id: 'off_color',
					type: 'colorpicker',
					label: 'Off Color',
					default: combineRgb(0, 0, 0),
				},
				{
					id: 'on_color',
					type: 'colorpicker',
					label: 'On Color',
					default: combineRgb(255, 0, 0),
				},
				{
					id: 'on_color_preview',
					type: 'colorpicker',
					label: 'On Color preview',
					default: combineRgb(0, 255, 0),
				}
			],
			callback: async(feedback) => {

				if (await self.isPageSet(feedback.options.num)) {
					
					if (self.isPageActive(feedback.options.num)) {

						if (self.isPreview()) {
							return {
								bgcolor: feedback.options.on_color_preview,
								text: feedback.options.num +'\\n'+ self.getConfiguredPageDescription(feedback.options.num)
							};
						} else {
							return {
								bgcolor: feedback.options.on_color ,
								text: feedback.options.num +'\\n' +self.getConfiguredPageDescription(feedback.options.num)
							};
						}
					} else {
						return {
							bgcolor: feedback.options.off_color,
							text: feedback.options.num +'\\n'+ self.getConfiguredPageDescription(feedback.options.num)
						};
					}
					
				} else {
					return {
						bgcolor: feedback.options.unset_color,
					};
				}
			},
		},
		preview_is_selected: {
			name: 'Page is on air',
			type: 'advanced',
			label: 'Channel State',
			defaultStyle: {
				bgcolor: combineRgb(0, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'off_color',
					type: 'colorpicker',
					label: 'Not selected color',
					default: combineRgb(0, 0, 0),
				},
				{
					id: 'on_color',
					type: 'colorpicker',
					label: 'selected color',
					default: combineRgb(0, 255, 0),
				},
			],
			callback: (feedback) => {
				//console.log("page_is_on_air",self.isPageActive('Page'+feedback.options.num))

				if (self.isPreview()) {
					return {
						bgcolor: feedback.options.on_color,
					}
				} else {
					return {
						bgcolor: feedback.options.off_color,
					}
				}
			},
		},
		program_is_selected: {
			name: 'Program is on air',
			type: 'advanced',
			label: 'Channel State',
			defaultStyle: {
				bgcolor: combineRgb(0, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'off_color',
					type: 'colorpicker',
					label: 'Not selected color',
					default: combineRgb(0, 0, 0),
				},
				{
					id: 'on_color',
					type: 'colorpicker',
					label: 'selected color',
					default: combineRgb(255, 0, 0),
				},
			],
			callback: (feedback) => {
				//console.log("page_is_on_air",self.isPageActive('Page'+feedback.options.num))

				if (self.isPreview()) {
					return {
						bgcolor: feedback.options.off_color,
					}
				} else {
					return {
						bgcolor: feedback.options.on_color ,
					}
				}
			},
		},
		isBlank: {
			name: 'If Channel is blank',
			type: 'advanced',
			label: 'Channel blank',
			defaultStyle: {
				bgcolor: combineRgb(0, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'off_color',
					type: 'colorpicker',
					label: 'Not selected color',
					default: combineRgb(0, 0, 0),
				},
				{
					id: 'on_color',
					type: 'colorpicker',
					label: 'selected color',
					default: combineRgb(255, 0, 0),
				},
				{
					id: 'on_color_prw',
					type: 'colorpicker',
					label: 'selected color',
					default: combineRgb(0, 255, 0),
				}
			],
			callback: (feedback) => {
				//console.log("page_is_on_air",self.isPageActive('Page'+feedback.options.num))

				if (self.isPreview()) {

					if(self.isBlank()){
						return {
							bgcolor: feedback.options.on_color_prw,
						}
					}else{
						return {
							bgcolor: feedback.options.off_color,
						}
					}

				} else {

					if(self.isBlank()){
						return {
							bgcolor: feedback.options.on_color,
						}
					}else{
						return {
							bgcolor: feedback.options.off_color,
						}
					}
				}
			},
		},

		isClear: {
			name: 'If Channel is Clear',
			type: 'advanced',
			label: 'Channel Clear',
			defaultStyle: {
				bgcolor: combineRgb(0, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'off_color',
					type: 'colorpicker',
					label: 'Not selected color',
					default: combineRgb(0, 0, 0),
				},
				{
					id: 'on_color',
					type: 'colorpicker',
					label: 'selected color',
					default: combineRgb(255, 0, 0),
				},
				{
					id: 'on_color_prw',
					type: 'colorpicker',
					label: 'selected color',
					default: combineRgb(0, 255, 0),
				}
			],
			callback: (feedback) => {
				//console.log("page_is_on_air",self.isPageActive('Page'+feedback.options.num))

				if (self.isPreview()) {

					if(self.isClear()){
						return {
							bgcolor: feedback.options.on_color_prw,
						}
					}else{
						return {
							bgcolor: feedback.options.off_color,
						}
					}
					
				} else {

					if(self.isClear()){
						return {
							bgcolor: feedback.options.on_color,
						}
					}else{
						return {
							bgcolor: feedback.options.off_color,
						}
					}
				}
			},
		}
		,
		page_to_launch: {
			name: 'Page to launch',
			type: 'advanced',
			label: 'Page to launch',
			defaultStyle: {
				bgcolor: combineRgb(0, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'textinput',
					label: 'Text',
					id: 'toPlayTxT',
					default: 'Launch',
				}
			],
			
			callback: (feedback) => {

				var CTP = self.KeyPad.ClipToPlay;
				return {
					text: feedback.options.toPlayTxT + '\\n' + CTP,
				}
			},
		},
		flip_flop: {
			name: 'Is flip flop active',
			type: 'advanced',
			label: 'flip flop State',
			defaultStyle: {
				bgcolor: combineRgb(0, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'off_color',
					type: 'colorpicker',
					label: 'Not selected color',
					default: combineRgb(0, 0, 0),
				},
				{
					id: 'on_color',
					type: 'colorpicker',
					label: 'selected color',
					default: combineRgb(0, 255, 0),
				},
			],
			callback: (feedback) => {
				//console.log("page_is_on_air",self.isPageActive('Page'+feedback.options.num))

				if (self.flipflop) {
					return {
						bgcolor: feedback.options.on_color,
					}
				} else {
					return {
						bgcolor: feedback.options.off_color,
					}
				}
			},
		},
		auto_preview: {
			name: 'Is auto preview active',
			type: 'advanced',
			label: 'auto preview State',
			defaultStyle: {
				bgcolor: combineRgb(0, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'off_color',
					type: 'colorpicker',
					label: 'Not selected color',
					default: combineRgb(0, 0, 0),
				},
				{
					id: 'on_color',
					type: 'colorpicker',
					label: 'selected color',
					default: combineRgb(0, 255, 0),
				},
			],
			callback: (feedback) => {
				//console.log("page_is_on_air",self.isPageActive('Page'+feedback.options.num))

				if (self.autoPreview) {
					return {
						bgcolor: feedback.options.on_color,
					}
				} else {
					return {
						bgcolor: feedback.options.off_color,
					}
				}
			},
		},
	}) 
}
