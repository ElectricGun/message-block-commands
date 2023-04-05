const MessageReader = require("message-executor")

Events.run(Trigger.update, () => {
    if(!Vars.state.menu & !Vars.state.paused) {
        MessageReader.messageReader()
    }
})