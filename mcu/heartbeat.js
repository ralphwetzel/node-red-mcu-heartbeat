/*
    node-red-mcu-heartbeat by @ralphwetzel
    Copyright 2022 - 2023 Ralph Wetzel
    https://github.com/ralphwetzel/node-red-mcu-heartbeat
    License: MIT
*/

import { Node } from "nodered";

class mcuHeartbeat extends Node {

    static type = "mcu-heartbeat";

    onStart(config) {
        super.onStart(config);
        
        let self = this;

        // enable heartbeat signal
        if (config.heartbeat === true) {
            self.ping();
            setInterval(function() {
                self.ping();
            }, config.pulse * 1000 || 5000);    
        }

        if (config.launch === true) {
            setTimeout(function() {
                self.send([
                    null,
                    {
                        topic: "launch",
                        payload: Date.now()
                    }
                ])
            }, 100);
        }

        self.triggerLabel = config.triggerLabel;
    }

    onMessage(msg, done) {
        trace.left(JSON.stringify({
            state: "notify", 
            type: "success", 
            label: "Successfully injected: " + this.triggerLabel
        }), "NR_EDITOR");        
        this.send(msg);
        done();
    }

    static {
        RED.nodes.registerType(this.type, this);
      }

    ping() {
        this.status({ "fill": "green", "shape": "dot", "text": "connected" });
    }

}
