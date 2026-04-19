const {
    MEMBER_ROLE_ID,
    MC_ROLE_ID,
    VERIFY_CHANNEL_ID,
    GET_ROLES_CHANNEL_ID
} = require('./config');

const tutorials = {
    verify: {
        title: "🔐 Adholokham MC • Verification Guide",
        video: "https://youtu.be/MqOQOWszmdk",
        pages: [
            `Step 1:
Join the Discord server, accept the rules, and make sure you receive the <@&${MEMBER_ROLE_ID}> role.

Step 2:
Go to <#${GET_ROLES_CHANNEL_ID}> and obtain the <@&${MC_ROLE_ID}> role.`,

            `Step 3:
Join the Minecraft server at \`gamerluttan.online\` and log in once.

Step 4:
You will receive a 4-digit verification code.
Make sure to remember this code.`,

            `Step 5:
Return to Discord and go to <#${VERIFY_CHANNEL_ID}>.

Step 6:
Use the command:
/verify [code]

Step 7:
Join the Minecraft server again.`,

            `Step 8:
When prompted, register using:
/register [password] [password]

✅ You now have full access to Adholokham MC!`
        ]
    },

    install: {
        title: "📦 Adholokham MC • OmniCraft Installation",
        video: "https://youtu.be/MqOQOWszmdk",
        pages: [
            `If you are using the official Minecraft launcher:

1. Download the modpack from CurseForge.
2. Add the Simple Voice Chat mod to your mods folder.
3. Launch the game.

✅ That’s it!`,

            `If you are using TLauncher or another third-party launcher:

Step 1:
Open TL Mods and click "Create Modpack".

Step 2:
Set:
• Minecraft Version: 1.20.1
• Forge Version: 47.4.0`,

            `Step 3:
Disable the following:
• SkinSystem TL
• Optimization FPS

Step 4:
Download the modpack : https://drive.google.com/drive/folders/1atnerao-95hymKFLSTMIwfrtczxRdAsY`,

            `Step 5:
Copy and paste the modpack files into your newly created modpack folder.

Alternatively:
Download from CurseForge and manually add Simple Voice Chat.`,

            `Step 6:
Click Play.

✅ You are ready to join Adholokham MC!`
        ]
    }
};

module.exports = { tutorials };