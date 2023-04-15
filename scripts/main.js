const Commands = require("message-executor")

Events.run(Trigger.update, () => {
    if(!Vars.state.menu & !Vars.state.paused) {
        Commands.readMessages()
    }
})

Events.on(ClientLoadEvent, () => {
    /*Commands.addCommand("js",
    [function jsfunc(messageBlock, javascript){    //TO FIX unterminated loops will crash the game
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
    ["string"]]
    )
    */
})
