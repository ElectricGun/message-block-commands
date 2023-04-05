/*
TODO
better syntax for message block commands, the current one sucks and doesn't allow variables
sense if js function is a loop, terminate to avoid crashing
*/


const stuff = {

    evalulateMessage (messageBlock, string){

        /* This method allows for calling some functions from message blocks */

        const header = "#!run/"

        if (string.slice(0,6) != header) {return}
        
        /* The format for functions is as follows

        name: [function, [arg1Type, arg2Type ...]]

        Examples:

        foo: [function bar() {print("This function was called from a message block")
        }],

        examplenull: [function out() {
        print(messageBlock+ " This method has no args")
        }],

        examplenumber: [function out(value) {
            print(messageBlock+ " The number is " + value)
        }],

        examplemultiargs: [function out(a, b) {
            print(messageBlock+ " The args are " + a +" and "+ b)
        }, 
        ["number", "string"]]

        */

        let selfDestruct = false

        const methods = {

            js: [function jsfunc(javascript){    /*TO FIX unterminated loops will crash the game*/
                try{

                    eval(javascript)
                    print(messageBlock+ " Executed: ")

                } catch(exception) {
                    if((exception instanceof InternalError)) {

                        print(messageBlock+ "[ERROR] Cannot evaluate functions within message block")

                    } else {

                        print(messageBlock+ " "+ exception)
                    }
                } return null
            }, 
            ["string"]],

            die: [function die(){
                selfDestruct = true
                return null
            }]
        }

        let args = string.slice(6).split("/")
        let argNumber

        for(let i = 0; i < args.length; i++) {

            argNumber = i    /*for debug*/

            try{

                let command = methods[args[i]][0]
                let inputType
                try{
                    inputType = methods[args[i]][1]
                } catch (exception){
                    inputType = [null]
                }

                let commandArgs = []

                if(inputType != null) {

                    for(let p = 0; p < inputType.length; p++) {

                        i++
                        let value = args[i]
                        commandArgs.push(value)
                    }
                    
                    try{

                        command.apply(this, commandArgs)

                        if(selfDestruct == true) {
                            messageBlock.message.delete(5,2147483647)
                            print(messageBlock + " Deleted")
                        }

                    } catch(exception) {

                        print(messageBlock + " [ERROR] " + exception)
                    }
                    
                } else{
                    command()   /*execute no args*/

                    if(selfDestruct == true) {
                        messageBlock.message.delete(5,2147483647)
                        print(messageBlock + " Deleted")
                    }
                }
            } catch(exception){

                    print(messageBlock+' [ERROR] Message block command #"' + argNumber +" "+ args[argNumber] +'" does not exist')

            }
        }
    },

    messageReader() {

        Vars.indexer.allBuildings(

            Vars.world.width(), 
            Vars.world.height(), 
            Math.max(Vars.world.width(), Vars.world.height())*8, b => {

                if(b.block == "message") {

                    let message = b.message.toString()
                    this.evalulateMessage(b, message)

                }
            }
        )
    }
}

module.exports = stuff
