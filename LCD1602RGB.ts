
// LCD 1602 RGB
// makecode LCD1602RGB package for microbit

// LCD

// LCD Adresse
const LCDadr = 0x3e

// Commands
const CLEARDISPLAY = 0x01;
const ENTRYMODESET = 0x04;
const DISPLAYCONTROL = 0X08;
const CURSORSHIFT = 0x10;
const FUNCTIONSET = 0X20;
const SETCGRAMADDR = 0X40;
const SETDDRAMADDR = 0X80;

// Display Entry Mode 
const ENTRYLEFT = 0x02;
const ENTRYSHIFTDECREMENT = 0x00;

// Display On Off Control
const DISPLAYON = 0X04;
const DISPLAYOFF = 0X00;
const BLINKON = 0X01;
const BLINKOFF = 0X00;

// Cursor or Display Shift  
const DISPLAYMOVE = 0x08;
const MOVERIGHT = 0X04;
const MOVELEFT = 0X00;

// Functionset 
const TWOLINE = 0X08;

// Custom Special Characters
const spec = [0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
    0x07, 0xFF, 0xDB, 0xA5, 0xDE, 0xEB, 0xE0, 0xF4, 0xF3]

// DDRAM Offset Zeile 1 und 2
const LineOffset = [0x00, 0x40];

// Init Color
const InitRed = 230
const InitGreen = 40
const InitBlue = 40

enum BlinkVal {
    //% block="On"
    On,
    //% block="Off"
    Off
}

enum DisplayVal {
    //% block="On"
    On,
    //% block="Off"
    Off
}

enum ShiftVal {
    //% block="Right"
    Right,
    //% block="Left"
    Left
}

//% weight=100 color=#295b89 icon="\uf108"
namespace LCD1602RGB {

    //% block="Init LCD and RGB"
    //% weight=100 blockGap=2
    export function LcdInit(): void {
        LCDcmd(FUNCTIONSET | TWOLINE);
        LCDcmd(ENTRYMODESET | ENTRYLEFT | ENTRYSHIFTDECREMENT);
        CreateCustomChar();
        RGBbegin();
        LCDcmd(DISPLAYCONTROL | DISPLAYON);
        RGB(InitRed, InitGreen, InitBlue)
    }

    //% block="Write Text %s|at x %x|y %y"
    //% weight=90 blockGap=2
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    //% x.fieldOptions.precision=1 y.fieldOptions.precision=1
    export function WriteText(s: string, x: number, y: number): void {
        LCDcmd(SETDDRAMADDR | (LineOffset[y] + x));
        for (let i = 0; i < s.length; i++) {
            LCDwrite(s.charCodeAt(i))
        }
    }

    /**
    * @param n is number will be show, eg: 0
    * @param x is LCD column position, eg: 0
    * @param y is LCD row position, eg: 0
    */
    //% block="Show Number %n|at x %x|y %y"
    //% weight=90 blockGap=2
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    //% x.fieldOptions.precision=1 y.fieldOptions.precision=1
    export function ShowNumber(n: number, x: number, y: number): void {
        let s = n.toString()
        LCDcmd(SETDDRAMADDR | (LineOffset[y] + x));
        for (let i = 0; i < s.length; i++) {
            LCDwrite(s.charCodeAt(i))
        }
    }

    // Write Special Character
    //% block="Write Spec Char n %n at x %x y %y"
    //% weight=90 blockGap=2
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    //% n.min=0 n.max=15
    //% x.fieldOptions.precision=1 y.fieldOptions.precision=1
    export function PrintSpecChar(n: number, x: number, y: number): void {
        LCDcmd(SETDDRAMADDR | (LineOffset[y] + x));
        LCDwrite(spec[n])
    }

    //% block="Show All Special Characters 0-15"
    //% weight=90 blockGap=10
    export function PrintAllSpecChar(): void {
        ClearDisplay();
        for (let i = 0; i < 16; i++) {
            LCDwrite(spec[i])
        }
    }

    //% block="Clear Display" 
    //% weight=90 blockGap=2 
    export function ClearDisplay(): void {
        LCDcmd(CLEARDISPLAY);
        basic.pause(2);
    }

    //% block="Clear Line y %y"
    //% weight=90 blockGap=10 
    //% y.min=0 y.max=1
    //% y.fieldOptions.precision=1
    export function ClearLine(y: number): void {
        const zeile = "                ";
        LCDcmd(SETDDRAMADDR | (LineOffset[y]));
        for (let i = 0; i < zeile.length; i++) {
            LCDwrite(zeile.charCodeAt(i))
        }
    }

    //% block="Set Position x %x and y %y" 
    //% weight=90 blockGap=10 
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    //% x.fieldOptions.precision=1 y.fieldOptions.precision=1
    export function SetPosition(x: number, y: number) {
        LCDcmd(SETDDRAMADDR | (LineOffset[y] + x));
    }

    //% block="Cursor Blink $Val"
    //% weight=90 blockGap=2 
    export function CursorBlink(Val: BlinkVal): void {
        switch (Val) {
            case BlinkVal.On:
                LCDcmd(DISPLAYCONTROL | DISPLAYON | BLINKON);
                break;
            case BlinkVal.Off:
                LCDcmd(DISPLAYCONTROL | DISPLAYON | BLINKOFF);
                break;
        }
    }

    //% block="Display $Val"
    //% weight=90 blockGap=2 
    export function Display(Val: DisplayVal): void {
        switch (Val) {
            case DisplayVal.On:
                LCDcmd(DISPLAYCONTROL | DISPLAYON);
                break;
            case DisplayVal.Off:
                LCDcmd(DISPLAYCONTROL | DISPLAYOFF);
                break;
        }
    }

    //% block="Shift $Val"
    //% weight=90 blockGap=10 
    export function Shift(Val: ShiftVal): void {
        switch (Val) {
            case ShiftVal.Right:
                LCDcmd(CURSORSHIFT | DISPLAYMOVE | MOVERIGHT);
                break;
            case ShiftVal.Left:
                LCDcmd(CURSORSHIFT | DISPLAYMOVE | MOVELEFT);
                break;
        }
    }

    function LCDcmd(value: number): void {
        let buffer = pins.createBuffer(2);
        buffer[0] = 0x80;
        buffer[1] = value;
        pins.i2cWriteBuffer(LCDadr, buffer);
        basic.pause(1);
    }

    function LCDwrite(value: number): void {
        let buffer = pins.createBuffer(2);
        buffer[0] = 0x40;
        buffer[1] = value;
        pins.i2cWriteBuffer(LCDadr, buffer);
        basic.pause(1);
    }


    //   Custom Character erstellen
    //	 Max. 8 Zeichen

    const CharArray = [
        // Degree [0][j]
        [
            0b00000,
            0b10110,
            0b01001,
            0b01000,
            0b01000,
            0b01001,
            0b00110,
            0b00000
        ],
        // Dewpoint tau 
        [
            0b00000,
            0b00000,
            0b01111,
            0b10100,
            0b00100,
            0b00100,
            0b00100,
            0b00000
        ],
        // Humidity phi
        [
            0b00000,
            0b00000,
            0b10010,
            0b10101,
            0b01110,
            0b00100,
            0b00100,
            0b00000
        ],
        // Up
        [
            0b00000,
            0b00100,
            0b01110,
            0b10101,
            0b00100,
            0b00100,
            0b00100,
            0b00000
        ],
        // Down
        [
            0b00000,
            0b00100,
            0b00100,
            0b00100,
            0b10101,
            0b01110,
            0b00100,
            0b00000
        ],
        // Smile [5][j]
        [
            0b00000,
            0b00000,
            0b01010,
            0b00100,
            0b00100,
            0b10001,
            0b01110,
            0b00000
        ],
	// Stairs [6][j]
        [
            0b00000,
            0b00001,
            0b00011,
            0b00110,
            0b01100,
            0b11000,
            0b00000,
	    0b00000
        ],
	// Frame [7][j]
        [
            0b11111,
            0b10001,
            0b10001,
            0b10001,
            0b10001,
            0b10001,
            0b10001,
            0b11111
        ]
    ];

    /** Code ist die Adresse des Zeichens im Zeichensatz 0,1,2,...*/
    function CreateCustomChar(): void {
        for (let i = 0; i < 8; i++) {
            let code = i;
            LCDcmd(SETCGRAMADDR | ((code & 0x7) << 3));
            let Buffer = pins.createBuffer(9);
            Buffer[0] = 0x40;
            for (let j = 1; j < 9; j++) {
                Buffer[j] = CharArray[i][j - 1];
            }
            pins.i2cWriteBuffer(LCDadr, Buffer);
            basic.pause(1)
        }
    }


    // RGB

    // RGB Address
    const RGBadr = 0x60;

    // Color Register
    const REG_RED = 0x04      // pwm2 LED Brightness
    const REG_GREEN = 0x03    // pwm1 LED Brightness
    const REG_BLUE = 0x02     // pwm0 LED Brightness

    // Contol Register
    const A_INC = 0xA2  // Auto-Increment: only for brightness LED registers

    // Register
    const REG_MODE1 = 0x00
    const VAL_MODE1 = 0x00      // Normal Mode, not Sleep

    const REG_LEDOUT = 0x08     // LED output state
    const VAL_LEDOUT = 0x3F     // LED 0-2 individually controllable

    function RGBbegin(): void {
        RGBcmd(REG_MODE1, VAL_MODE1);
        RGBcmd(REG_LEDOUT, VAL_LEDOUT);
    }

    /**
    *   @param r is red, eg: 230
    *   @param g is green, eg: 40
    *   @param b is blue, eg: 40
    */
    //% block="Red %r Green %g Blue %b" 
    //% weight=100 blockGap=10 
    //% r.min=0 r.max=255
    //% g.min=0 g.max=255
    //% b.min=0 b.max=255
    //% r.fieldOptions.precision=1
    //% g.fieldOptions.precision=1
    //% b.fieldOptions.precision=1
    export function RGB(r: number, g: number, b: number): void {
        let buffer = pins.createBuffer(4);
        buffer[0] = A_INC;
        buffer[1] = b;
        buffer[2] = g;
        buffer[3] = r;
        pins.i2cWriteBuffer(RGBadr, buffer);
        basic.pause(1);
    }

    function RGBcmd(cmd: number, value: number): void {
        let buffer = pins.createBuffer(2);
        buffer[0] = cmd;
        buffer[1] = value;
        pins.i2cWriteBuffer(RGBadr, buffer);
        basic.pause(1);
    }
}
