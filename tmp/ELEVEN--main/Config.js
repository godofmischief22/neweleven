const { ButtonStyle } = require("discord.js");
module.exports = {
    Token: process.env.TOKEN,
    Prefix: ".",
    Client: {
        ID: process.env.CLIENT_ID,
        Secret: process.env.CLIENT_SECRET,
    },
    button: {
        grey: ButtonStyle.Secondary,
        blue: ButtonStyle.Primary,
        link: ButtonStyle.Link,
        red: ButtonStyle.Danger,
        green: ButtonStyle.Success,
    },
    spotify: {
        ID: "a568b55af1d940aca52ea8fe02f0d93b",
        Secret: "e8199f4024fe49c5b22ea9a3dd0c4789",
    },
    Api: {
        Topgg: "",
    },
    MongoData: "mongodb+srv://kxklow:928zzl@cluster0.0cz6waa.mongodb.net/?retryWrites=true&w=majority",
    EmbedColor: "#6d2eb5",
    Owners: ["1131806691969728593"],
    Nodes: [
    {
        name: "Arino Node",
        url: "v3.ajieblogs.eu.org:80",
        auth: "https://dsc.gg/ajidevserver",
        secure: false,
    },
    {
        name: "Pylex Node",
        url: "lavalink.razorbot.buzz:6969",
        auth: "dsc.gg/razorsupport",
        secure: false,
    }
],

    hooks: {
        guildAdd: "https://discord.com/api/webhooks/1365929906311270480/NzvVA2oGWEwGY0-HUcmvqBrQTOtVkJ6Tpe07rJl95LtAtw0uzsYifxsSRNpwUABu1V0w",
        guildRemove: "https://discord.com/api/webhooks/1365932038070337626/iNa938BT1xyM-5CAEDdOGgAWYgV6gQ-hyOaD9hVcp44_Xf2TE9ISBlAhwYICCR5X6Iep",
        Error: "https://discord.com/api/webhooks/1365932058546802699/9g96ssI1afmqiZ9KPqBrYAeKfcTWYFDZ4F4Nz3nf7KAn43Oi4x0FW3Dd_jKNKY90KJ_t",
    },
    links: {
        invite: "https://discord.com/oauth2/authorize?client_id=1365958278026104832&permissions=8&integration_type=0&scope=bot+applications.commands",
        bg: "",
        support: "https://discord.gg/ZRXSwG3Xb6",
        vote: "",
        banner: "https://cdn.discordapp.com/attachments/1144136903193526372/1365962015289507850/ChatGPT_Image_Apr_27_2025_11_12_48_AM.png?ex=680f36c2&is=680de542&hm=61f48f3ab11a3b71c501d96cdd512f7b24c894e6b668c35b7b4a9c4030f9baf8&",
        spotify: "",
        soundcloud: "",
    },
};
