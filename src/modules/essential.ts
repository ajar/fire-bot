import { CategoryChannel, MessageReaction, Snowflake } from "discord.js";
import { ComponentMessage } from "@fire/lib/extensions/componentmessage";
import { FireMember } from "@fire/lib/extensions/guildmember";
import { FireMessage } from "@fire/lib/extensions/message";
import { FireGuild } from "@fire/lib/extensions/guild";
import { FireUser } from "@fire/lib/extensions/user";
import { Module } from "@fire/lib/util/module";

export default class Essential extends Module {
  ticketMessage: FireMessage;
  ticketMessageId: Snowflake;
  guildId: Snowflake;
  guild: FireGuild;

  constructor() {
    super("essential");
    this.guildId = "864592657572560958";
    this.ticketMessageId = "880169115967442974";
  }

  async init() {
    if (this.client.config.dev) return this.remove();
    if (this.client.readyAt) await this.ready();
    else this.client.once("ready", () => this.ready());
  }

  async ready() {
    this.guild = this.client.guilds.cache.get(this.guildId) as FireGuild;
    if (!this.guild) {
      this.remove();
      return;
    }
  }

  async handleTicket(trigger: ComponentMessage, user: FireUser) {
    const member = trigger.member
      ? trigger.member
      : ((await this.guild.members.fetch(user)) as FireMember);
    if (!member) return "no member"; // how
    let emoji: string;
    if (trigger instanceof MessageReaction) {
      emoji = trigger.emoji.name;
      try {
        await trigger.users.remove(user);
      } catch {}
    } else {
      if (!trigger.message) return "no message";
      const component = (trigger.message as FireMessage).components
        .map((component) =>
          component.type == "ACTION_ROW"
            ? component?.components ?? component
            : component
        )
        .flat()
        .find(
          (component) =>
            component.type == "BUTTON" &&
            component.style != "LINK" &&
            component.customId == trigger.customId
        );
      if (component.type != "BUTTON" || component.style == "LINK")
        return "non button";
      if (!component.emoji) return "unknown emoji";
      emoji =
        typeof component.emoji == "string"
          ? component.emoji
          : component.emoji.name;
    }
    if (!emoji) return "no emoji";
    if (emoji == "🖥️") {
      const category = this.guild.channels.cache.get(
        "755795962462732288"
      ) as CategoryChannel;
      if (!category) return "no category";
      return await this.guild.createTicket(
        member,
        "General Support",
        null,
        category
      );
    }
    if (emoji == "💸") {
      const category = this.guild.channels.cache.get(
        "755796036198596688"
      ) as CategoryChannel;
      if (!category) return "no category";
      return await this.guild.createTicket(
        member,
        "Purchase Support",
        null,
        category
      );
    }
    if (emoji == "🐛") {
      const category = this.guild.channels.cache.get(
        "755795994855211018"
      ) as CategoryChannel;
      if (!category) return "no category";
      return await this.guild.createTicket(
        member,
        "Bug Report",
        null,
        category
      );
    }
  }
}