const Table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

class Buffer {
    _thisData;
    _thisIndex;

    constructor(Data) {
        this._thisData = Data;
        this._thisIndex = 0;
    }

    f1(Length) {
        let Value = 0;
        let Mul = 1;

        for (let Index = 0; Index < Length; Index++) {
            const Digit = Table.indexOf(this._thisData[this._thisIndex++]);

            if (Digit < 0) {
                throw new Error("Invalid fumen");
            }

            Value += Digit * Mul;
            Mul *= 64;
        }

        return Value;
    }

    f2() {
        return this._thisIndex >= this._thisData.length;
    }
}

function f1(Fumen) {
    const Match = Fumen.match(/[vmd]115@/);

    if (!Match) {
        throw new Error("Only v115 supported");
    }

    return Fumen
        .substring(Match.index + 5)
        .replace(/[?\s]+/g, "")
        .replace(/&.*/, "");
}

function f2(Value) {
    switch (Value) {
        case 0: return "EMPTY";
        case 1: return "I";
        case 2: return "L";
        case 3: return "O";
        case 4: return "Z";
        case 5: return "T";
        case 6: return "J";
        case 7: return "S";
        case 8: return "GRAY";
    }

    throw new Error("Invalid piece");
}

function f3(Value) {
    switch (Value) {
        case 0: return "reverse";
        case 1: return "right";
        case 2: return "spawn";
        case 3: return "left";
    }

    throw new Error("Invalid rotation");
}

function f4(Value, Piece, Rotation) {
    let X = Value % 10;
    const OriginY = Math.floor(Value / 10);
    let Y = 23 - OriginY - 1;

    if (Piece === "O" && Rotation === "left") {
        X += 1;
        Y -= 1;
    } else if (Piece === "O" && Rotation === "reverse") {
        X += 1;
    } else if (Piece === "O" && Rotation === "spawn") {
        Y -= 1;
    } else if (Piece === "I" && Rotation === "reverse") {
        X += 1;
    } else if (Piece === "I" && Rotation === "left") {
        Y -= 1;
    } else if (Piece === "S" && Rotation === "spawn") {
        Y -= 1;
    } else if (Piece === "S" && Rotation === "right") {
        X -= 1;
    } else if (Piece === "Z" && Rotation === "spawn") {
        Y -= 1;
    } else if (Piece === "Z" && Rotation === "left") {
        X += 1;
    }

    return { X, Y };
}

function f5(Value) {
    const Width = 10;
    const FieldTop = 23;
    const NumFieldBlocks = Width * 24;

    let Current = Value;

    const Piece = f2(Current % 8);
    Current = Math.floor(Current / 8);

    const Rotation = f3(Current % 4);
    Current = Math.floor(Current / 4);

    const Coordinate = f4(
        Current % NumFieldBlocks,
        Piece,
        Rotation
    );

    Current = Math.floor(Current / NumFieldBlocks);

    const Rise = !!(Current % 2);
    Current = Math.floor(Current / 2);

    const Mirror = !!(Current % 2);
    Current = Math.floor(Current / 2);

    const Colorize = !!(Current % 2);
    Current = Math.floor(Current / 2);

    const Comment = !!(Current % 2);
    Current = Math.floor(Current / 2);

    const Lock = !(Current % 2);

    return {
        Piece,
        Rotation,
        X: Coordinate.X,
        Y: Coordinate.Y,
        Lock,
        Comment,
        Colorize,
        Mirror,
        Rise
    };
}

function f6(BufferObject) {
    const Cells = 240;

    let Index = 0;
    let Changed = true;

    while (Index < Cells) {
        const DiffBlock = BufferObject.f1(2);

        const Diff = Math.floor(DiffBlock / Cells);
        const Count = DiffBlock % Cells;

        if (Diff === 8 && Count === Cells - 1) {
            Changed = false;
        }

        Index += Count + 1;
    }

    return Changed;
}

function Decode(Fumen) {
    const BufferObject = new Buffer(f1(Fumen));

    const Pages = [];

    let Repeat = -1;

    while (!BufferObject.f2()) {
        let Changed;

        if (Repeat > 0) {
            Changed = false;
            Repeat--;
        } else {
            Changed = f6(BufferObject);

            if (!Changed) {
                Repeat = BufferObject.f1(1);
            }
        }

        const Action = f5(BufferObject.f1(3));

        if (Action.Comment) {
            const Length = BufferObject.f1(2);

            for (
                let Index = 0;
                Index < Math.floor((Length + 3) / 4);
                Index++
            ) {
                BufferObject.f1(5);
            }
        }

        Pages.push({
            Piece: Action.Piece,
            Rotation: Action.Rotation,
            X: Action.X,
            Y: Action.Y,
            Lock: Action.Lock,
            Rise: Action.Rise,
            Mirror: Action.Mirror,
            Colorize: Action.Colorize,
            FieldChanged: Changed
        });
    }

    return Pages;
}

if (typeof module !== "undefined") {
    module.exports = {
        Decode
    };
}
