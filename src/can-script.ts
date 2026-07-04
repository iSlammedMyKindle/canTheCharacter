import gsap from "gsap";
import { type effectDTO, effect } from "./types/effect.types";

let timeline = gsap.timeline();

const animations = {
    "applause": () => {

        timeline.call(() => {
            console.log('applause start');
            const element = (document.getElementById("audio-applause")! as HTMLAudioElement);
            element.currentTime = 0;
            element.play()
        });
        // Repeat this 10 times:
        for (let i = 0; i < 10; i++) {
            timeline
                .to(".rect", {
                    marginTop: 100,
                    duration: .1
                })
                .to(".rect", {
                    marginTop: 0,
                    duration: .1
                })
        }
    },

    "aww": () => {

    },

    "boo": () => {

    },

    "crickets": () => {

    },

    "mumbling": () => {

    },

    "laughter": () => {

    },
}

const wsConnection = new WebSocket("ws://localhost:9011");
wsConnection.addEventListener("open", () => wsConnection.send("Hello!"));
wsConnection.addEventListener("message", (evt => {
    let data: effectDTO;
    console.log(evt.data);

    // First attempt to parse the data
    try {
        data = JSON.parse(evt.data);
    }
    catch (e) {
        console.error("Invalid! All responses must be JSON", e);
        return
    }

    // Then we're gonna want to ensure animation exists for this
    try {
        const effectStr = effect.parse(data.effect);
        animations[effectStr]();
    }
    catch (e) {
        console.error("An effect that doesn't exist attempted to be used!", e);
    }
}));