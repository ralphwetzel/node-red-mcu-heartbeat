/*
    node-red-mcu-heartbeat by @ralphwetzel
    Copyright 2022 - 2023 Ralph Wetzel
    https://github.com/ralphwetzel/node-red-mcu-heartbeat
    License: MIT
*/

const clone = require("clone");

module.exports = function(RED) {
    "use strict";

    function heartbeatNode(n) {
        RED.nodes.createNode(this,n);
        let node = this;

        // necessary to initialize status in editor
        // all following updates are done by the MCU & processed on client side!
        node.status({
            text: "Not connected",
            shape: "ring",
            fill: "grey"
        });

        node.on("input", function(msg, send, done) {
            node.__getProxy?.()?.send2mcu("inject", node.z, node.id);
            done();
            return;
        });

        node.on("mcu:plugin:build:prepare", function(n, nodes) {

            // console.log(nodes);

            // crate shadow inject node - only active on mcu
            let inject = clone(n);

            delete inject.heartbeat;
            delete inject.pulse;
            delete inject.launch;

            inject.id = node.injector || RED.util.generateId(),
            inject.type = "inject";
            inject.name = "mcu_heartbeat_injector";
            inject.outputs = 1;
            inject.wires = [[n.id]];

            // delete all inject node relevant properties
            // from mcu-heartbeat
            delete n.props
            delete n.repeat
            delete n.crontab
            delete n.once
            delete n.onceDelay
            delete n.topic
            delete n.payload
            delete n.payloadType

            // mcu-heartbeat needs to know whom to delegate the inject
            n.injector = inject.id;

            // add the additional node to the nodes array...
            nodes.push(inject);
            // console.log(nodes);
        });

    }

    RED.nodes.registerType("mcu-heartbeat",heartbeatNode);
    registerMCUModeType("mcu-heartbeat", "mcu-heartbeat");

    RED.httpAdmin.post("/heartbeat/:id", RED.auth.needsPermission("heartbeat.write"), function(req,res) {
        var node = RED.nodes.getNode(req.params.id);
        if (node != null) {
            node.receive();
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    });

}
