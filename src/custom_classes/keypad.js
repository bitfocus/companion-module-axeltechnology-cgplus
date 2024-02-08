/**/
//Class Whith KeyPad functions
class Keypad {

    //local variable tbhat keeps track of the current selected keypad value
	ClipToPlay = ''

	//function that adds key pressed to ClipToPlay value
	keypress(index) {

		this.ClipToPlay += ''+ index
		//console.log("LEMME SEE ",this.ClipToPlay)
	}

	//reset value function
	reset() {
		this.ClipToPlay = ''
    }


}

module.exports = Keypad;
/**/