/*
TODO
better syntax for message block commands, the current one sucks and doesn't allow variables
check if js function is a loop, terminate to avoid crashing
*/

/* To create a method from outside, use the following format

name: [function, ["string", arg1 type, arg2 type ...]]    //messageBlock doesnt work without the first "string"

Examples:

foo: [function bar(messageBlock) {print(messageBlock + " This function was called from a message block")
}, ["string"]],,

examplenull: [function out(messageBlock) {
print(messageBlock+ " This method has no args")
}, ["string"]],

examplenumber: [function out(messageBlock, value) {
    print(messageBlock+ " The number is " + value)
}, ["string"]],

examplemultiargs: [function out(messageBlock, a, b) {
    print(messageBlock+ " The args are " + a +" and "+ b)
}, 
["string", "number", "string"]]

*/
/*
die: [function die(){
    selfDestruct = true
    return null
}]
*/

Vars.tree.get("commands/commands.json").writeString('{"listCommands": []}')

var methods = {

}

const stuff = {

    evalulateMessage (messageBlock, string){

        let listCommands = JSON.parse(Vars.tree.get("commands/commands.json").readString()).listCommands

        /* This method allows for calling some functions from message blocks */

        const header = "#!run/"

        if (string.slice(0,6) != header) {return}

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

                let commandArgs = [messageBlock]

                if(inputType != null) {

                    for(let p = 0; p < inputType.length; p++) {

                        i++
                        let value = args[i]
                        if (value == null) {
                            print(messageBlock + " [ERROR] "+"Missing args")
                            return
                        }
                        commandArgs.push(value)
                    }
                    
                    try{

                        command.apply(this, commandArgs)

                        if(/*selfDestruct == true*/ true) {
                            messageBlock.message.delete(0,5)
                            print(messageBlock + " Deleted")
                        }

                    } catch(exception) {

                        print(messageBlock + " [ERROR] " + exception)
                    }
                    
                } else{
                    command()   /*execute no args*/

                    if(/*selfDestruct == true*/ true) {
                        messageBlock.message.delete(0,5)
                        print(messageBlock + " Deleted")
                    }
                }
            } catch(exception){
                var sus = false;
                var BreakException = {};
                try {
                    args.forEach(arg => {
                        if(listCommands.includes(arg)) {
                            sus = true
                            throw BreakException}
                    })
                } catch (e) {
                    if (e !== BreakException) {print(e)}
                }
                if (sus == false) {print(exception)}
                    //print(messageBlock+' [ERROR] Message block command #"' + argNumber +" "+ args[argNumber] +'" does not exist')

            }
        }
    },

    readMessages() {

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
    },

    addCommand(name, func) {
        methods[name] = func

        let prevObject = JSON.parse(Vars.tree.get("commands/commands.json").readString())
        let listCommands = prevObject.listCommands
        listCommands.push(name)
        let newObject = JSON.stringify(prevObject)
        Vars.tree.get("commands/commands.json").writeString(newObject)

        print("Added command " + name)
    },

    printMethods() {
        Object.keys(methods).forEach(p => print(p))
    }
}

module.exports = stuff
