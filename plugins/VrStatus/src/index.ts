import { React, ReactNative as RN } from "@vendetta/metro/common";
import { findByName, findByTypeName, findByStoreName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";

let unpatchAvatar: (() => void) | undefined;
let presenceStore: any;

function getUserId(props: any): string | undefined {
    const id = props?.userId ?? props?.user?.id ?? props?.user_id ?? props?.user?.userId;
    return typeof id === "string" ? id : undefined;
}

function hasActiveVrPresence(userId: string): boolean {
    try {
        const state = presenceStore?.getState?.();
        const presence =
            presenceStore?.getPresence?.(userId) ??
            state?.presences?.[userId] ??
            state?.[userId];

        const clientStatus =
            presence?.clientStatus ??
            presence?.client_status ??
            presence?.clientStatuses;

        const vr = clientStatus?.vr;
        return vr === "online" || vr === "idle" || vr === "dnd" || vr === true;
    } catch {
        return false;
    }
}

function createVrBadge() {
    return React.createElement(
        RN.View,
        {
            accessible: true,
            accessibilityLabel: "Active VR presence",
            pointerEvents: "none",
            style: {
                position: "absolute",
                right: -2,
                bottom: -2,
                width: 19,
                height: 19,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: "#313338",
                backgroundColor: "#23A55A",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 20
            }
        },
        React.createElement(
            RN.View,
            {
                style: {
                    width: 10,
                    height: 6,
                    borderWidth: 1.5,
                    borderColor: "#FFFFFF",
                    borderBottomWidth: 0,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    alignItems: "center",
                    justifyContent: "center"
                }
            },
            React.createElement(RN.View, {
                style: {
                    position: "absolute",
                    left: -3,
                    top: 2,
                    width: 2,
                    height: 4,
                    borderRadius: 1,
                    backgroundColor: "#FFFFFF"
                }
            }),
            React.createElement(RN.View, {
                style: {
                    position: "absolute",
                    right: -3,
                    top: 2,
                    width: 2,
                    height: 4,
                    borderRadius: 1,
                    backgroundColor: "#FFFFFF"
                }
            })
        )
    );
}

function onLoad() {
    try {
        presenceStore = findByStoreName("PresenceStore");
    } catch {
        presenceStore = undefined;
    }

    let Avatar: any;
    try {
        Avatar = findByTypeName("Avatar") ?? findByName("Avatar");
    } catch {
        Avatar = undefined;
    }

    if (!Avatar) {
        console.warn("[VrStatus] Avatar component was not found; plugin loaded without an avatar patch.");
        return;
    }

    unpatchAvatar = after("type", Avatar, (args: any[], original: any) => {
        const userId = getUserId(args?.[0]);
        if (!userId || !hasActiveVrPresence(userId) || !original) return;

        return React.createElement(
            RN.View,
            { style: { position: "relative", alignSelf: "flex-start" } },
            original,
            createVrBadge()
        );
    });
}

function onUnload() {
    try {
        unpatchAvatar?.();
    } finally {
        unpatchAvatar = undefined;
        presenceStore = undefined;
    }
}

export { onLoad, onUnload };
export default { onLoad, onUnload };
