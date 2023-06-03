/*
TODO
stuff
*/

Vars.tree.get("commands/commands.json").writeString('{"listCommands": []}')

var methods = {}
var debugMode = false

let header = "/"

const stuff = {

    splitMulti (string, tokens){
        let splitChar = "split"
        let splitChar2 = splitChar + splitChar    // to remove doubles
        for(let i = 0; i < tokens.length; i++) {
            let re = new RegExp(tokens[i], "g")
            string = string.replace(re, splitChar + tokens[i] + splitChar)
        }
        string = string.replace(RegExp(splitChar2, "g"), splitChar)
        string = string.split(splitChar)
        return string;
    },

    evalulateMessage (messageBlock, string){
        /* This method calls functions from a message block */

        if (Vars.net.client()|| Vars.state.rules.sector) {
        return
        }
        
        let listCommands = JSON.parse(Vars.tree.get("commands/commands.json").readString()).listCommands

        const punctuation = [" ", "=", ","]
        const punctuationNames = ["space", "equals", "comma"]

        if (string.slice(0, header.length) != header) {return}

        let commandString = string.slice(header.length)
        let tokens = this.splitMulti(commandString, punctuation)

        // Parse tokens

        let commandRaw = []
        for(let i = 0; i < tokens.length; i++) {
            let token = tokens[i]
            let commandToken = punctuation.indexOf(token)
            if (commandToken == -1) {
                commandToken = tokens[i]
            }
            if (typeof commandToken === "string") {
                commandRaw.push(commandToken)
            } else {
                commandRaw.push(punctuationNames[commandToken])
            }
        }
        commandRaw = commandRaw.filter((e) => {return e === 0 || e})    // remove cringe, if any
        if (debugMode) {
            print(tokens)
            print(commandRaw)
        }

        let commandName, expectNext, error
        let isArg = false
        let args = []
        let prevTokenType = "token"
        for (let i = 0; i < commandRaw.length; i++) {
            let currToken = commandRaw[i]
            if (i > 0) {
                let back = 0
                while (true) {
                    back += 1
                    var prevToken = commandRaw[i - back]
                    if (prevToken != "space") {
                        break
                    }
                }
            }
            let nextToken
            try {
                let front = 0
                while (true) {
                    front += 1
                    nextToken = commandRaw[i + front]
                    if (nextToken != "space") {
                        break
                    }
                }
            } catch (e) {
                nextToken = null
            }

            if (currToken != "space" && currToken != expectNext && expectNext != undefined && expectNext != "arg") {
                error = "Unexpected token"
                break
            } else {
                if (debugMode) {
                    if (currToken != "space") {
                        print("[Iteration] " + i + " [Expecting] " + expectNext + " [Prev Token ] " + prevToken + " [Current Token] " + currToken + " [Next Token ] " + nextToken + " [Is Arg] " + isArg)
                    } else (
                        print("[Iteration] " + i + " Space")
                    )
                }
            }
            if (isArg == false) {
                if (typeof currToken === "string" && commandName == undefined) {
                    commandName = currToken
                    expectNext = "args"
                }
                if (currToken == "args" && commandName != undefined) {
                    expectNext = "equals"
                }
                if (prevToken == "args" && currToken == "equals") {
                    expectNext = "arg"
                    isArg = true
                }
                if (currToken == "comma" && prevTokenType == "arg") {
                    expectNext = "arg"
                    isArg = true
            }
            } else {
                if (punctuationNames.indexOf(currToken) == -1) {
                    args.push(currToken)
                    prevTokenType = "arg"
                    if (nextToken == undefined) {
                        break
                    }
                    if (nextToken != "comma") {
                        error = "Comma expected after arg"
                        break
                    }
                }
            }
        }

        if (error == undefined) {
            if (debugMode) print(messageBlock + " Parsed command!")
        } else {
            if (debugMode) print(error)
            return
        }

        // Execute command
        try {
            let command = methods[commandName][0]
            args.unshift(messageBlock)
            
            if (args.length < command.length) {
                print(messageBlock + " [ERROR] " + "Missing arguments. " + "Expecting: " + (command.length - 1 ) + " Current: " + (args.length - 1))
                return
            } else if (args.length > command.length) {
                print(messageBlock + " [ERROR] " + "Too many arguments. " + "Expecting: " + (command.length - 1) + " Current: " + (args.length - 1))
                return
            }
            try{

                if(args.length > 0) {
                        //    Call function with args
                        command.apply(this, args)

                        if(true) {    //for later
                            
                            messageBlock.message.delete(0, header.length)
                            if (debugMode) print(messageBlock + " Deleted")
                            
                        }
                } else{
                    //    Call function without args
                    command()

                    if(true) {    //for later
                        
                        messageBlock.message.delete(0, header.length)
                        if (debugMode) print(messageBlock + " Deleted")
                            
                    }
                    return
                }

            } catch(exception){
                if(debugMode) print(exception)
            }
        } catch(e) {
            var sus = false;
            var BreakException = {};
            try {
                args.forEach(arg => {
                    if(listCommands.includes(arg)) {
                        sus = true
                        throw BreakException}
                })
            } catch (e) {
                if (e !== BreakException) {
                    print(messageBlock + " [ERROR]" + e)
                }
            }
            if (sus == false && debugMode) {
                print(e)
                print(e.stack)
                //print(messageBlock + " [ERROR] Message block command does not exist")
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

        if (debugMode) print("Added command " + name)
    },

    printMethods() {
        Object.keys(methods).forEach(p => print(p))
    },

    setHeader(string, name) {
        header = string
        print("Command header: " + string)
    }
}

module.exports = stuff
