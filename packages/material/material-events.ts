import { Emitter } from "@solid-primitives/event-bus";
import { MaterialNode } from "./node";

export type MaterialNodeEvent = {
    node: MaterialNode;
};

export type MaterialEvents = {
    nodeAdded: MaterialNodeEvent;
    nodeRemoved: MaterialNodeEvent;
    nodeParameterChanged: MaterialNodeEvent;
    nodeMoved: MaterialNodeEvent;
    nodeConnectionsChanged: MaterialNodeEvent;
};

export type MaterialEventsEmitter = Emitter<MaterialEvents>;
