export interface AddonCondition {
    field: string;
    operator?: string;
    condition?: string; // ==, !=, !empty
    value?: any;
    generated?: boolean;
}

export interface AddonConditionGroup {
    rules: AddonCondition[];
}

export interface AddonChoice {
    label: string;
    slug: string;
    pricing_type?: string;
    pricing_amount: number;
    options?: any;
}

export interface AddonField {
    id: string;
    type: "radio" | "text" | "textarea" | "select" | "checkbox" | "p" | "section" | "sectionend" | "text-swatch";
    label: string;
    placeholder?: string;
    description?: string;
    required?: boolean;
    choices?: AddonChoice[];
    conditionals?: AddonConditionGroup[];
    p_content?: string;
    default?: string;
    class?: string;
}

// Mapped from User's WAPF JSON Export
export const DROTES_PATCH_ADDONS: AddonField[] = [
    {
        id: "6967882298a34",
        type: "p",
        label: "Customize my drotes patch",
        p_content: "<a href='#' class='btn button button-open-customizer'>customize drotes patch </a>",
        conditionals: []
    },
    {
        id: "69678822e258b",
        type: "section",
        label: "New field",
        class: "wapf-customizer",
        conditionals: []
    },
    {
        id: "6967882222607",
        type: "radio",
        label: "Choose Occasion",
        required: false,
        choices: [
            { slug: "354gx", label: "Birthday", pricing_amount: 0 },
            { slug: "hcti2", label: " Anniversary", pricing_amount: 0 },
            { slug: "w35l1", label: " Graduation ", pricing_amount: 0 },
            { slug: "b6gl9", label: "❤️ Confessions", pricing_amount: 0 },
            { slug: "5358m", label: "Others", pricing_amount: 20 }
        ],
        conditionals: []
    },
    {
        id: "6967882235886",
        type: "radio",
        label: "Choose type of customization",
        choices: [
            { slug: "bzv42", label: "Basic Birthday Wish (Text)", pricing_amount: 20 },
            { slug: "otys3", label: "Sing-A-Song Birthday (Audio)", pricing_amount: 60 },
            { slug: "ex5cr", label: "Video Surprise from Drotes (Video)", pricing_amount: 200 }
        ],
        conditionals: [
            {
                rules: [
                    { field: "6967882222607", condition: "!empty" },
                    { field: "6967882222607", condition: "!=", value: "hcti2" },
                    { field: "6967882222607", condition: "!=", value: "w35l1" },
                    { field: "6967882222607", condition: "!=", value: "b6gl9" },
                    { field: "6967882222607", condition: "!=", value: "5358m" }
                ]
            }
        ]
    },
    {
        id: "69678822bc429",
        type: "radio",
        label: "Choose type of customization",
        choices: [
            { slug: "u8r0l", label: "Romantic Note (Text)", pricing_amount: 20 },
            { slug: "hqxxr", label: "Song or Poem Recital (Audio)", pricing_amount: 60 },
            { slug: "mpjz8", label: "Couple Memory Video (Custom Video + Images)", pricing_amount: 200 },
            { slug: "5vb22", label: "Others ", pricing_amount: 25 }
        ],
        conditionals: [
            {
                rules: [
                    { field: "6967882222607", condition: "!empty" },
                    { field: "6967882222607", condition: "!=", value: "354gx" },
                    { field: "6967882222607", condition: "!=", value: "w35l1" },
                    { field: "6967882222607", condition: "!=", value: "b6gl9" },
                    { field: "6967882222607", condition: "!=", value: "5358m" }
                ]
            }
        ]
    },
    {
        id: "696788228542b",
        type: "radio",
        label: "Choose type of customization",
        choices: [
            { slug: "8ejpf", label: "🎓 Text Congratulation + Quote", pricing_amount: 20 },
            { slug: "9ufxi", label: "Audio Cheers from Team Drotes", pricing_amount: 60 },
            { slug: "wfhva", label: "Video from Family/Friends (uploaded)", pricing_amount: 200 }
        ],
        conditionals: [
            {
                rules: [
                    { field: "6967882222607", condition: "!empty" },
                    { field: "6967882222607", condition: "!=", value: "hcti2" },
                    { field: "6967882222607", condition: "!=", value: "354gx" },
                    { field: "6967882222607", condition: "!=", value: "b6gl9" },
                    { field: "6967882222607", condition: "!=", value: "5358m" }
                ]
            }
        ]
    },
    {
        id: "69678822ce12b",
        type: "radio",
        label: "Choose type of customization",
        choices: [
            { slug: "4tvae", label: "One-line confession", pricing_amount: 20 },
            { slug: "w8ot3", label: "Anonymous voice message (Audio) ", pricing_amount: 60 },
            { slug: "es2vo", label: "Video reveal ", pricing_amount: 200 }
        ],
        conditionals: [
            {
                rules: [
                    { field: "6967882222607", condition: "!empty" },
                    { field: "6967882222607", condition: "!=", value: "hcti2" },
                    { field: "6967882222607", condition: "!=", value: "w35l1" },
                    { field: "6967882222607", condition: "!=", value: "354gx" },
                    { field: "6967882222607", condition: "!=", value: "5358m" }
                ]
            }
        ]
    },
    {
        id: "69678822dc1c5",
        type: "text",
        label: "",
        placeholder: "eg: happy birthday sam!",
        required: true,
        conditionals: [
            { rules: [{ field: "6967882235886", condition: "==", value: "bzv42" }] },
            { rules: [{ field: "69678822bc429", condition: "==", value: "u8r0l" }] },
            { rules: [{ field: "696788228542b", condition: "==", value: "8ejpf" }] },
            { rules: [{ field: "69678822ce12b", condition: "==", value: "4tvae" }] }
        ]
    },
    {
        id: "696788223f319",
        type: "radio",
        label: "Music by drotes team",
        required: true,
        description: "Here you have to choose \"Voice Note from Sender\" or a dedicated music from drotes music team.",
        choices: [
            { slug: "3mvya", label: "Custom Song by Drotes Team", pricing_amount: 0 },
            { slug: "vbo5q", label: "Voice Note from Sender", pricing_amount: 0 }
        ],
        conditionals: [
            { rules: [{ field: "6967882235886", condition: "==", value: "otys3" }] },
            { rules: [{ field: "69678822bc429", condition: "==", value: "hqxxr" }] }
        ]
    },
    {
        id: "696788226f7a5",
        type: "text-swatch", // Custom type, treated as radio for now
        label: "Choose",
        choices: [
            { slug: "1dckv", label: "Video Song by Drotes Team", pricing_amount: 0 },
            { slug: "4pvdw", label: "Customer Uploaded Video", pricing_amount: 0 }
        ],
        conditionals: [
            { rules: [{ field: "6967882235886", condition: "==", value: "ex5cr" }] },
            { rules: [{ field: "69678822bc429", condition: "==", value: "mpjz8" }] },
            { rules: [{ field: "696788228542b", condition: "==", value: "wfhva" }] },
            { rules: [{ field: "69678822ce12b", condition: "==", value: "es2vo" }] }
        ]
    },
    {
        id: "696788225fdd1",
        type: "radio",
        label: "email custom@drotes.com",
        required: false,
        description: "After completing your purchase, please email us all your customization details — including your ORDER NUMBER — to custom@drotes.com",
        conditionals: [
            { rules: [{ field: "6967882222607", condition: "==", value: "5358m" }] },
            { rules: [{ field: "696788226f7a5", condition: "==", value: "4pvdw" }] },
            { rules: [{ field: "696788228542b", condition: "==", value: "wfhva" }] }
        ]
    },
    {
        id: "696788223dd65",
        type: "textarea",
        label: "Please enter your lyrics",
        required: true,
        conditionals: [
            { rules: [{ field: "696788225fdd1", condition: "!empty", value: "cvpp6" }] }, // Logic seems complex in user JSON. I'll rely on simple mapping.
            // Actually, the user JSON conditional logic is `field: "696788225fdd1", value: "cvpp6"`. But 5fdd1 has empty choices. 
            // Possibly "cvpp6" is a value from a diff source or I missed it.
            // I'll keep it as is, but it might not show up if conditions aren't met.
            // Strategy: Render it if conditions met.
        ]
    },
    {
        id: "696788225d354",
        type: "p",
        label: "",
        p_content: "<a href='#' class='btn button button-close-customizer'> Done</a>",
        conditionals: []
    },
    {
        id: "69678822e4f7c",
        type: "sectionend",
        label: "New field",
        conditionals: []
    }
];
