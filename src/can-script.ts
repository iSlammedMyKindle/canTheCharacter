import gsap from "gsap";
import { type effectDTO, effect } from "./types/effect.types";

let timeline = gsap.timeline();

function playSound(audioId: string) {
    console.log(audioId, ' start');
    const element = (document.getElementById(audioId)! as HTMLAudioElement);
    element.currentTime = 0;
    element.play()
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

function aww(clockwise: boolean = false) {
    timeline
        .call(() => playSound("audio-aww"))
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

    changeEyes("standard");
}

const animations = {
    "applause": () => {
        changeEyes("standard");

        timeline.call(() => {
            playSound('audio-applause');
        });
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
        changeEyes("standard")
    },

    "aww-s": () => {
        changeEyes("sad");
        aww();
        changeEyes("standard")
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
        changeEyes("standard");
    },

    "crickets": () => {
        changeEyes("crickets");
        timeline.call(() => {
            playSound('audio-crickets');
        })

        // Repeat 6 times
        for (let i = 0; i < 5; i++) {
            timeline
                .to(".rect", {
                    rotate: -45,
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
                duration: .2,
                delay: .2,
            })
        changeEyes("standard");
    },

    "gasp": () => {
        changeEyes("shocked");

        timeline
            .call(() => playSound("audio-gasp"))
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

        changeEyes('standard');
    },

    "laughter": () => {

        timeline.call(() => {
            playSound('audio-laughter');
        });

        laugh();
    },

    "laughter-s": () => {

        timeline.call(() => {
            playSound('audio-laughter-s');
        });

        laugh(false);
    },

    "mumbling": () => {
        changeEyes("mumbling");

        timeline.call(() => {
            playSound('audio-mumbling');
        });

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

        changeEyes("standard");
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
    }
    catch (e) {
        console.error("An effect that doesn't exist attempted to be used!", e);
    }
}));