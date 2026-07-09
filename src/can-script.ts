import gsap from "gsap";
import { type effectDTO, effect } from "./types/effect.types";

let timeline = gsap.timeline();

function playSound(audioId: string) {
    timeline.call(() => {
        console.log(audioId, ' start');
        const element = (document.getElementById(audioId)! as HTMLAudioElement);
        element.currentTime = 0;
        element.play()
    });
}

function changeEyes(eyesType: string = "standard") {
    timeline
        .to(".eyes", {
            display: "none",
            duration: 0
        })
        .to(`[data-category=${eyesType}]`, {
            display: "block",
            duration: 0
        })
}

function blink() {
    changeEyes("standard");

    timeline
        .to('[data-category="standard"]', {
            transform: "scaleY(.0)",
            duration: .1
        })
        .to('[data-category="standard"]', {
            transform: "scaleY(1.3)",
            duration: .05
        })
        .to('[data-category="standard"]', {
            transform: "scaleY(1)",
            duration: .2
        })
}

function aww(clockwise: boolean = false) {
    playSound("audio-aww");
    timeline
        .to(".rect", {
            rotation: clockwise ? 45 : -45,
            duration: 2
        })
        .to('.rect', {
            rotation: 0,
            duration: .3
        })
}

function laugh(long: boolean = true) {
    changeEyes("laugh");

    // Repeat this 15 times (long), 7 times (short)
    for (let i = 0; i < (long ? 15 : 7); i++) {
        timeline
            .to(".rect", {
                marginTop: 100,
                // If the number is 0, do a positive rotation, otherwise a negative rotation
                rotation: Math.floor(Math.random() * 2) ? Math.floor(Math.random() * 45) : Math.floor(Math.random() * -45),
                duration: .07
            })
            .to(".rect", {
                marginTop: 0,
                rotation: 0,
                duration: .07
            })
    }
}

const animations = {
    "applause": () => {
        changeEyes("standard");
        playSound('audio-applause');
        // Repeat this 10 times:
        for (let i = 0; i < 12; i++) {
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

    "aww-h": () => {
        changeEyes("hearts");
        aww(true);
    },

    "aww-s": () => {
        changeEyes("sad");
        aww();
    },

    "boo": () => {
        changeEyes("angry");
        playSound("audio-boo");
        timeline
            .to('.rect', {
                rotation: 45,
                duration: 2.5,
            })
            .to('.rect',
                {
                    rotation: 0,
                    duration: .1
                }
            )
    },

    "crickets": () => {
        changeEyes("crickets");
        playSound('audio-crickets');

        // Repeat 6 times
        for (let i = 0; i < 5; i++) {
            timeline
                .to(".rect", {
                    rotate: -45,
                    marginTop: 75,
                    duration: .2,
                })
                .to(".rect", {
                    rotate: 45,
                    duration: .2,
                    delay: .2,
                })
        }

        timeline
            .to(".rect", {
                rotate: 0,
                marginTop: 0,
                duration: .2,
                delay: .2,
            })
    },

    "gasp": () => {
        changeEyes("shocked");
        playSound("audio-gasp")

        timeline
            .to(".rect", {
                rotation: 60,
                marginTop: 100,
                marginLeft: 300,
                duration: .2
            })
            .to('.rect', {
                rotation: 45,
                duration: .4
            })
            .to('.rect', {
                rotation: 0,
                marginTop: 0,
                marginLeft: 200,
                duration: .5
            })
    },

    "laugh": () => {
        playSound('audio-laugh');
        laugh();
    },

    "laugh-s": () => {
        playSound('audio-laugh-s');
        laugh(false);
    },

    "lol": () => {
        playSound('audio-laugh-s');
        laugh(false);
    },

    "mumbling": () => {
        changeEyes("mumbling");
        playSound('audio-mumbling');

        // Repeat this 12 times:
        for (let i = 0; i < 12; i++) {
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
}

const wsConnection = new WebSocket("ws://localhost:9011");
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

        // Change the eyes back to standard and blink once the animation is done
        blink();
    }
    catch (e) {
        console.error("An effect that doesn't exist attempted to be used!", e);
    }
}));

// Blink routine
setInterval(() => {
    blink();
}, 30000)