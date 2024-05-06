
const { combineRgb } = require('@companion-module/base')

module.exports = function (self) {

	let presets = []

	//----------------------------------------------------------------
	//  Blank BUTTON 
	//----------------------------------------------------------------
	presets['Blank'] = {
		type: 'button',
		category: 'Action',
		name: 'Blank',
		style: {
			text: 'Blank',
			size: '18',
			color: combineRgb(255,255,255)
		},
		steps: [
			{
				down: [
					{
						actionId: 'Blank',
						options: {}
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'isBlank',
				options: {
					num: i,
					off_color:combineRgb(0, 0, 0),
					on_color:combineRgb(255, 0, 0),
					on_color_prw: combineRgb(0, 255, 0)

				}
			},
		],
	}
	//----------------------------------------------------------------
	//  Take_Program
	//----------------------------------------------------------------
	presets['Take_Program'] = {
		type: 'button',
		category: 'Action',
		name: 'Take Program',
		style: {
			text: 'Take Program',
			size: '18',
			color: combineRgb(255,255,255)
		},
		steps: [
			{
				down: [
					{
						actionId: 'Press_Take_Program',
						options: {}
					},
				],
			},
		],

	}
	//----------------------------------------------------------------
	//  Tags_Take_Program
	//----------------------------------------------------------------
	presets['Tags_Take_Program'] = {
		type: 'button',
		category: 'Action',
		name: 'Tags Take Program',
		style: {
			text: 'Tags Take Program',
			size: '8',
			color: combineRgb(255,255,255)
		},
		steps: [
			{
				down: [
					{
						actionId: 'Press_Tags_Take_Program',
						options: {}
					},
				],
			},
		],

	}
	//----------------------------------------------------------------
	//  Tags_Take_Preview
	//----------------------------------------------------------------
	presets['Tags_Take_Preview'] = {
		type: 'button',
		category: 'Action',
		name: 'Tags Take Preview',
		style: {
			text: 'Tags Take Preview',
			size: '8',
			color: combineRgb(255,255,255)
		},
		steps: [
			{
				down: [
					{
						actionId: 'Press_Tags_Take_Preview',
						options: {}
					},
				],
			},
		],

	}

	//----------------------------------------------------------------
	//  Flip Flop
	//----------------------------------------------------------------
	presets['Flip_Flop'] = {
		type: 'button',
		category: 'Action',
		name: 'Flip Flop',
		style: {
			text: 'Flip Flop',
			size: '18',
			color: combineRgb(255,255,255)
		},
		steps: [
			{
				down: [
					{
						actionId: 'Set_Flip_Flop',
						options: {}
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'flip_flop',
				options: {
					num: i,
					off_color:combineRgb(0, 0, 0),
					on_color:combineRgb(255, 0, 0),
				}
			},
		],
	}

	//----------------------------------------------------------------
	//  Set_Tags_Auto_Preview
	//----------------------------------------------------------------
	presets['Tags_Auto_Preview'] = {
		type: 'button',
		category: 'Action',
		name: 'Tags Auto Preview',
		style: {
			text: 'Tags Auto Preview',
			size: '8',
			color: combineRgb(255,255,255)
		},
		steps: [
			{
				down: [
					{
						actionId: 'Set_Tags_Auto_Preview',
						options: {}
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'auto_preview',
				options: {
					num: i,
					off_color:combineRgb(0, 0, 0),
					on_color:combineRgb(255, 0, 0),
				}
			},
		],

	}

	//----------------------------------------------------------------
	//  Clear BUTTON 
	//----------------------------------------------------------------
	presets['Clear'] = {
		type: 'button',
		category: 'Action',
		name: 'Clear',
		style: {
			text: 'Clear',
			size: '18',
			color: combineRgb(255,255,255)
		},
		steps: [
			{
				down: [
					{
						actionId: 'Clear',
						options: {}
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'isClear',
				options: {
					num: i,
					off_color:combineRgb(0, 0, 0),
					on_color:combineRgb(255, 0, 0),
					on_color_prw: combineRgb(0, 255, 0)

				}
			},
		],
	}

	//----------------------------------------------------------------
	//  PRW BUTTON 
	//----------------------------------------------------------------
	presets['PRV'] = {
		type: 'button',
		category: 'Action',
		name: 'PRV BAR',
		style: {
			text: 'PRV\n BAR',
			size: '18',
			color: combineRgb(255,255,255)
		},
		steps: [
			{
				down: [
					{
						actionId: 'Set_PRW',
						options: {}
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'preview_is_selected',
				options: {
					off_color:combineRgb(0, 0, 0),
					on_color:combineRgb(0, 255, 0),
				}
				
			},
		],
	}

	// //----------------------------------------------------------------
	// //  PRG BUTTON 
	// //----------------------------------------------------------------
	presets['PGM'] = {
		type: 'button',
		category: 'Action',
		name: 'PGM BAR',
		style: {
			text: 'PGM\n BAR',
			size: '18',
			color: combineRgb(255,255,255)
		},
		steps: [
			{
				down: [
					{
						actionId: 'Set_PRG',
						options: {}
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'program_is_selected',
				options: {
					off_color:combineRgb(0, 0, 0),
					on_color:combineRgb(255, 0, 0),
				}
			},
		],
	}
	// //----------------------------------------------------------------
	// //  BUTTON 
	// //----------------------------------------------------------------
	for (let i = 1; i <= 99; ++i) {

		presets[i.toString()] = {
			type: 'button',
			category: 'Single Pages',
			name: i.toString(),
			style: {
				text: i.toString(),
				size: '18',
				color: combineRgb(255,255,255)
			},
			steps: [
				{
					down: [
						{
							actionId: 'Take_Page',
							options: {
			 					num: i,
			 				}
						},
					],
				},
			],
			feedbacks: [
				{
					feedbackId: 'page_is_on_air',
					options: {
						num: i,
						unset_color: combineRgb(181, 181, 181),
						off_color:combineRgb(0, 0, 0),
						on_color:combineRgb(255, 0, 0),
						on_color_preview: combineRgb(0, 255, 0)

					}
				},
			],
		}
	}


	presets.push({
		type: 'button',
		category: 'KeyPad',
		name: 'Launch Clip',

		style: { 
			text:'Launch',
			color: combineRgb(255, 255, 255),
			textaligment: 'center:center',
			size: '18',
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'Launch_keypress',
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'page_to_launch',
				options: {
					toPlayTxT:'Launch'
				}
				
			},
		],

	})


	//Keypad Buttons
	for (var i = 0; i <= 9; i++) {

		is = i.toString()
		//Number Button
		presets.push({
			type: 'button',
			category: 'KeyPad',
			name: is,
			
			style: { 
				text: is,
				color: combineRgb(255, 255, 255),
				size: '18',
			},
			steps: [
				{
					down: [
						{
							actionId: 'Keypress',
							options: {
								NumChoise: i,
			 				}
						},
					],
				},
			],

		})
	}

	for (let charCode = 'A'.charCodeAt(0); charCode <= 'Z'.charCodeAt(0); charCode++) {
		const uppercaseLetter = String.fromCharCode(charCode);
		const lowercaseLetter = uppercaseLetter.toLowerCase();
	
		// Uppercase letter
		presets[uppercaseLetter] = {
			type: 'button',
			category: 'Multi Pages',
			name: uppercaseLetter,
			style: {
				text: uppercaseLetter,
				size: '18',
				color: combineRgb(255, 255, 255),
			},
			steps: [
				{
					down: [
						{
							actionId: 'Take_Page',
							options: {
								num: uppercaseLetter,
							},
						},
					],
				},
			],
			feedbacks: [
				{
					feedbackId: 'page_is_on_air',
					options: {
						num: uppercaseLetter,
						unset_color: combineRgb(181, 181, 181),
						off_color: combineRgb(0, 0, 0),
						on_color: combineRgb(255, 0, 0),
						on_color_preview: combineRgb(0, 255, 0),
					},
				},
			],
		};
	
		// Lowercase letter
		presets[lowercaseLetter] = {
			type: 'button',
			category: 'Multi Pages',
			name: lowercaseLetter,
			style: {
				text: lowercaseLetter,
				size: '18',
				color: combineRgb(255, 255, 255),
			},
			steps: [
				{
					down: [
						{
							actionId: 'Take_Page',
							options: {
								num: lowercaseLetter,
							},
						},
					],
				},
			],
			feedbacks: [
				{
					feedbackId: 'page_is_on_air',
					options: {
						num: lowercaseLetter,
						unset_color: combineRgb(181, 181, 181),
						off_color: combineRgb(0, 0, 0),
						on_color: combineRgb(255, 0, 0),
						on_color_preview: combineRgb(0, 255, 0),
					},
				},
			],
		};
	}

	self.setPresetDefinitions(presets)
}
