import { FireMember } from "@fire/lib/extensions/guildmember";
import { FireMessage } from "@fire/lib/extensions/message";
import { constants } from "@fire/lib/util/constants";
import { MessageAttachment, Role } from "discord.js";
import { Language } from "@fire/lib/util/language";
import { Command } from "@fire/lib/util/command";
import * as tinycolor from "tinycolor2";
import * as centra from "centra";

const maybeColor = (phrase: string) =>
  phrase
    ? typeof tinycolor(phrase)?.isValid == "function" &&
      tinycolor(phrase).isValid()
      ? tinycolor(phrase)
      : undefined
    : tinycolor.random();

export default class Color extends Command {
  constructor() {
    super("color", {
      description: (language: Language) =>
        language.get("COLOR_COMMAND_DESCRIPTION"),
      args: [
        {
          id: "color",
          readableType: "color",
          required: false,
          default: undefined,
        },
      ],
      aliases: ["colour", "colors", "colours"],
      enableSlashCommand: true,
      restrictTo: "all",
    });
  }

  async exec(message: FireMessage, args: { color?: string }) {
    const color: tinycolor.Instance = maybeColor(args.color);
    if (!color || typeof color.isValid != "function" || !color.isValid()) {
      return await message.error("COLOR_ARGUMENT_INVALID", {
        random: tinycolor.random().toHexString(),
      });
    }

    const colorInfo = `<:pallete:804044718379237407> ${message.language.get(
      "COLOR_HEADING",
      { color: color.toName() || color.toHexString() }
    )}

**HEX:** ${color.toHexString()}
**RGB:** ${color.toRgbString()}
**HSL:** ${color.toHslString()}
**HSV:** ${color.toHsvString()}`;

    const image = await centra(
      `${constants.url.imageGen}color?color=${color.toHex()}`
    )
      .header("User-Agent", this.client.manager.ua)
      .send();

    if (image.statusCode != 200)
      return await message.channel.send({ content: colorInfo });
    else {
      const attachment = new MessageAttachment(
        image.body,
        `${color.toHex()}.png`
      );
      return await message.channel.send({
        content: colorInfo,
        files: [attachment],
      });
    }
  }
}
