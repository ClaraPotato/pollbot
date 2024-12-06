import { SlashCommandBuilder } from "@discordjs/builders"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"
import { DISCORD_CLIENT_ID, DISCORD_TOKEN } from "./settings"

//I'm not entirely sure why these commands are in this code as they are marked as obsolete. 
//I have commented them out to preven them from being built and showing up in the Discord bot options. 
/*
export const pollCommand = new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Poll command')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('create')
            .setDescription('[OBSOLETE] Use /poll_create')
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('results')
            .setDescription('[OBSOLETE] Use /poll_results')
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('close')
            .setDescription('[OBSOLETE] Use /poll_close')
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('audit')
            .setDescription('[OBSOLETE] Use /poll_audit. Please set permissions for this command in your Discord settings')
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('update')
            .setDescription('[OBSOLETE] Use /poll_update.')
    )
*/

export const pollCreateCommand = new SlashCommandBuilder()
    .setName('poll_create')
    .setDescription('Create a poll')
    .addStringOption(option =>
        option
            .setName('topic')
            .setDescription('The topic of the poll')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('options')
            .setDescription('Comma-separated poll options')
            .setRequired(true)
)
    //At this time Randomized Ballots isn't fully explained, but my understanding is that it will randomize the ballots before calculating the scores. I'm not sure of the benefit of this.
    //Since it's defaulted to on, I don't plan on touching this until I find more information
    .addBooleanOption(option =>
        option
            .setName('randomized_ballots')
            .setDescription('Enables randomized ballot option ordering if true. (default: True)')
            .setRequired(false)
)
    //This simply ensures that users can view results at any time. More often than not, this is a good thing and I don't see why this would need to be turned off in the terms of a Discord poll. 
    .addBooleanOption(option =>
        option
            .setName('anytime_results')
            .setDescription('Allows users to view results before the poll is closed. (default: True)')
            .setRequired(false)
    )

export const pollResultsCommand = new SlashCommandBuilder()
    .setName('poll_results')
    .setDescription('View poll results')
    .addStringOption(option =>
        option
            .setName('poll_id')
            .setDescription('The poll id to view results for')
            .setRequired(true)
    )
    //This shows you the result in a private message that only the user can see. This is great for not clogging up the feed with people checking on results.
    .addBooleanOption(option =>
        option
            .setName('private')
            .setDescription('Makes the command response private. (default: False)')
            .setRequired(false)
    )

//This command closes the poll before showing the results announding the winner.
export const pollCloseCommand = new SlashCommandBuilder()
    .setName('poll_close')
    .setDescription('Close a poll')
    .addStringOption(option =>
        option
            .setName('poll_id')
            .setDescription('The poll id to close')
            .setRequired(true)
    )
//I need to investigate this further. I'm not sure what the audit looks like. But it should be well documented at some point. 
export const pollAuditCommand = new SlashCommandBuilder()
    .setName('poll_audit')
    .setDescription('Audit a poll. Only the poll owner, admins, or pollbotAdmins can audit a poll.')
    .addStringOption(option =>
        option
            .setName('poll_id')
            .setDescription('The poll id to audit')
            .setRequired(true)
    )

//This allows you to make changes to a poll that is already active. The topic, closing time, and the other options
export const pollUpdateCommand = new SlashCommandBuilder()
    .setName('poll_update')
    .setDescription('Update a poll')
    .addStringOption(option =>
        option
            .setName('poll_id')
            .setDescription('The poll id to update')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('topic')
            .setDescription('Update the poll\'s topic')
    )
    .addStringOption(option =>
        option
            .setName('closes_at')
            .setDescription('Update the poll\'s closing time. ISO-format')
    )
    .addBooleanOption(option =>
        option
            .setName('randomized_ballots')
            .setDescription('Enables randomized ballot option ordering if true. (default: True)')
            .setRequired(false)
    )
    .addBooleanOption(option =>
        option
            .setName('anytime_results')
            .setDescription('Allows users to view results before the poll is closed. (default: True)')
            .setRequired(false)
    )

//The command name is really bad, and is hard to find in a server full of bots. I have changed this to include the "poll" prefix that all the other commands have.
export const deleteMyUserDataCommand = new SlashCommandBuilder()
    .setName('poll_unsafe_delete_my_user_data')
    .setDescription(`Deletes all of your polls and ballots. This is cannot be reversed.`)
    .addUserOption(option =>
        option
            .setName('confirm_user')
            .setDescription('Confirm your account')
            .setRequired(true)
    )
//Going to comment this out as well, since I commented out the other block. If we aren't building the obsolete commands...then there is no reason to go any further in the code with them. Removing them is the best course of action
/*
const obsoleteCommands = [
    pollCommand]
*/

const nonHelpCommands = [
    pollCreateCommand,
    pollResultsCommand,
    pollCloseCommand,
    pollAuditCommand,
    pollUpdateCommand,
    deleteMyUserDataCommand,
]

//displays help information. I'm sure that I'll need to update that help results at some point.
export const helpCommand = new SlashCommandBuilder()
    .setName('help')
    .setDescription(`View information about pollbot commands`)
    .addBooleanOption(option =>
        option
            .setName('public')
            .setDescription('Help message is visible to other users')
            .setRequired(false)
    )
    .addStringOption(option =>
        option
            .setName('command')
            .setDescription('Prints detailed help information for a command')
            .setRequired(false)
            .setChoices(nonHelpCommands.map(c => [c.name, c.name] as [name: string, value: string]))
    )


const okCommands = [
    ...nonHelpCommands,
    helpCommand,
]

/*
const commands = [
    ...obsoleteCommands,
    ...okCommands,
]
*/
const commands = [
    ...okCommands
]

export function matchCommand(commandName: string) {
    return okCommands.find(c => c.name === commandName)
}

const clientId = DISCORD_CLIENT_ID

const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN)

export async function registerCommands() {
    try {
        console.log('Started refreshing application (/) commands.')

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        )

        console.log('Successfully reloaded application (/) commands.')
    } catch (error) {
        console.error(error)
    }
}
