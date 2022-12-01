const JAB = "Jab"
const CROSS = "Cross"
const LEFT_HOOK = "Left Hook"
const RIGHT_HOOK = "Left Hook"
const LEFT_UPPERCUT = "Left Uppercut"
const RIGHT_UPPERCUT = "Right Uppercut"
const LEFT_BODY_KICK = "Left Body Kick"
const RIGHT_BODY_KICK = "Right Body Kick"

const combinationInformation = {
    "combo_1": [JAB, RIGHT_BODY_KICK],
    "combo_2": [JAB, CROSS, LEFT_BODY_KICK],
    "combo_3": [JAB, CROSS, LEFT_HOOK, RIGHT_BODY_KICK],
    "combo_4": [JAB, CROSS, LEFT_HOOK, CROSS, LEFT_BODY_KICK],
    "combo_5": [JAB, CROSS, LEFT_HOOK, CROSS, LEFT_UPPERCUT, RIGHT_BODY_KICK],
    "combo_6": [CROSS, LEFT_HOOK, CROSS],
    "combo_7": [LEFT_HOOK, CROSS, LEFT_HOOK],
    "combo_8": [RIGHT_UPPERCUT, LEFT_HOOK, CROSS],
    "combo_9": [LEFT_UPPERCUT, CROSS, LEFT_HOOK],
    "combo_10": [CROSS, LEFT_HOOK, CROSS]
}

export { combinationInformation }
