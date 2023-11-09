function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const rev = "v1.2.2";
const isDev = false;

module.exports = {
    getRev: () => rev,
    getIsDev: () => isDev,
    trySimpleReplyWhenContainsArray: async function(candArr, replyArr, message) {
        await sleep(500);
        for (let i = 0; i < candArr.length; ++i) {
            if (!message.content.includes(candArr[i])) continue;
            message.channel.sendTyping();
            setTimeout(() => {
                message.channel.send(replyArr[Math.floor(Math.random() * replyArr.length)]);
            }, 500 + Math.random() * 1500);
            return true;
        }
        return false;
    },
    trySimpleReactionWhenContainsArray: async function(candArr, reaction, message) {
        await sleep(500);
        for (let i = 0; i < candArr.length; ++i) {
            if (!message.content.includes(candArr[i])) continue;
            setTimeout(() => {
                message.react(reaction);
            }, Math.random() * 1500);
            return true;
        }
        return false;
    },
    temporaryMethodThatGetMessageByFetchingLatestChannelPost: async function(message) {
        const messages = await message.channel.messages.fetch({limit: 1});
        return [...messages][0][1];
    },
    fetchAllMessages: async function(channel) {
        let messages = [];

        let message = await channel.messages
            .fetch({ limit: 1 })
            .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));

        while (message) {
            await channel.messages
                .fetch({ limit: 100, before: message.id })
                .then(messagePage => {
                    messagePage.forEach(msg => messages.push(msg));

                    // Update our message pointer to be last message in page of messages
                    message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
                });
        }
        return messages;
    },
    containsCommand: function (commands, command, param = undefined) {
        return commands.commands.filter(c => c.command === command).filter(c => param === undefined || c.parameter === param).length !== 0
    },
    extractCommands: function (commandList, message) {
        let formattedContent = message.content.replace(/^<@[!&]?\d+>\s+/, '').trim();

        const commands = [];
        while(true) {
            const current = formattedContent;
            commandList.forEach(c => {
                const regex = new RegExp(`^\\s*(${c.command})((=(("((?:\\.|[^\\"])*)("|$))|(\\S*)?(\\s|$)))|(\\s|$))`);
                const match = formattedContent.match(regex);
                if (!match) return;

                const parameter = match[6] ?? match[8];
                commands.push({
                    command: c.command,
                    parameter: parameter
                });
                formattedContent = formattedContent.replace(match[0], "");
            });
            if (formattedContent === current) break;
        }

        return {
            message: formattedContent,
            commands: commands
        };
    },
    isMentioned: function (client, message) {
        if (message.mentions.users.size > 0 && message.mentions.users.has(client.user.id)) return true;
        return message.mentions.roles.size > 0 && message.mentions.roles.filter(x => x.tags.botId === client.user.id).size > 0;
    },
    sendHelpText: async function (commandList, client, message) {
        let commandDesc = commandList.map(c => {
            let msg = `>\ ◦\ \`${c.command}\`\t${c.description}`;
            if (c.hasOption)
                msg += "\n>\ \t\tオプション\n";
            if (c.hasOption && c.optionDescription)
                msg += ">\ \t\t\t" + c.optionDescription;
            if (c.options && c.options.length > 0)
                msg += c.options.map(o => ">\ \t\t\t◦\ `" + o.name + "`" + (o.description ? ("\t" + o.description) : "")).join("\n");
            return msg;
        }).join("\n");
        commandDesc = "\n🖊\ 利用可能なオプション一覧\n\t\tメッセージの先頭につけることで動作が変更されます。\n" + commandDesc

        await message.reply("**_DiscordBot-Painter_** (https://github.com/Asalato/DiscordBot-Painter) by Asalato, Rev: **" + rev + "**" + (isDev ? " (**DEV CHANNEL**)" : "") + "\n" + commandDesc);
    },
    replaceMentionsWithUsernames: function (mentions, content) {
        mentions.members.forEach((member) => {
            const mention = `<@!${member.id}>`;
            const username = member.displayName;
            const replacement = `${username}へ:`;
            content = content.replace(mention, replacement);
        });

        mentions.roles.forEach((role) => {
            const mention = `<@&${role.id}>`;
            const roleName = role.name;
            const replacement = `${roleName}へ:`;
            content = content.replace(mention, replacement);
        });

        mentions.users.forEach((user) => {
            const mention = `<@${user.id}>`;
            const username = user.username;
            const replacement = `${username}へ: `;
            content = content.replace(mention, replacement);
        });

        return content;
    }
}
