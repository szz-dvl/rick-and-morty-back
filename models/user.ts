import {
    prop,
    getModelForClass,
    ReturnModelType,
    DocumentType,
    pre,
    modelOptions,
    Severity
} from "@typegoose/typegoose";

import { Types } from "mongoose";
import bcrypt from "bcrypt";

interface CreateInfo {
    ip: string;
    ua: string;
}

interface EventInfo extends CreateInfo {
    event: string;
}

class Info {

    @prop({ required: true })
    ip!: string;

    @prop({ required: true })
    ua!: string;

    @prop({ required: true })
    date!: Date;

}

class HistoryEntry extends Info {

    @prop({ required: true })
    event!: string;

}

@pre<User>('save', async function () {

    if (this.isModified('password') || this.isNew) {
        this.password = await bcrypt.hash(
            this.password,
            process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS, 10) : 10
        );
    }
})
@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class User {
    @prop({ required: true, unique: true })
    public nick!: string;

    @prop({ required: true })
    public password!: string;

    @prop({ required: true, default: [] })
    public favs!: Types.Array<number>;

    @prop({ type: () => HistoryEntry, required: true, default: [], innerOptions: { _id: false } })
    public history!: HistoryEntry[];

    @prop({ required: true, _id: false })
    public created!: Info;

    public static async findByNick(this: ReturnModelType<typeof User>, nick: string) {
        return await this.findOne({ nick });
    }

    public event(this: DocumentType<User>, event: EventInfo) {

        const newLength = this.history.unshift({
            ...event,
            date: new Date()
        });

        if (newLength > 10) this.history = this.history.slice(0, 10);

        this.markModified("history");

        return this;
    }

    public create(this: DocumentType<User>, info: CreateInfo) {

        this.created = {
            ...info,
            date: new Date()
        };

        this.markModified("created"); // Little bit paraniod here ... ¬¬

        return this;
    }

    public pushFav(this: DocumentType<User>, fav: number) {

        if (!this.favs.includes(fav))
            this.favs.push(fav);

        this.markModified("favs");

        return this;
    }

    public pullFav(this: DocumentType<User>, fav: number) {

        this.favs = this.favs.filter(stored => stored !== fav) as Types.Array<number>;

        this.markModified("favs");

        return this;
    }

    /**
     * These two last functions "pushFavs" and "pullFavs" may be implemented by means of a
     * $pull and $push update operations, however, as we are getting the user from the JWT
     * strategy (what I'm not sure is the best practice) one tends to think that the half of the operation
     * is already done, and this is the main reason why this is done this way. Atomicity does not seems
     * compromised in any of the two cases. As a pro, when done this way, we can count on mongoose
     * hooks if we need to code some logic there.
     */
}

export default getModelForClass(User);