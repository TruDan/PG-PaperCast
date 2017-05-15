/**
 * Created by truda on 14/05/2017.
 */


module.exports = class PlayerSession {
    constructor(playerId, dsRecord) {
        this._id = playerId;
        this._dsRecord = dsRecord;

    }

    getId() {
        return this._id;
    }

    getInput() {
        return this._dsRecord.get();
    }

    close() {
        if(this._dsRecord !== undefined) {
            this._dsRecord.delete();
        }
    }

};