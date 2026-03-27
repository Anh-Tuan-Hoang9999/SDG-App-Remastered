import Card1Front from "../assets/cards/goal-1-front.webp";
import Card1Back from "../assets/cards/goal-1-back.webp";
import Card2Front from "../assets/cards/goal-2-front.webp";
import Card2Back from "../assets/cards/goal-2-back.webp";
import Card3Front from "../assets/cards/goal-3-front.webp";
import Card3Back from "../assets/cards/goal-3-back.webp";
import Card4Front from "../assets/cards/goal-4-front.webp";
import Card4Back from "../assets/cards/goal-4-back.webp";
import Card5Front from "../assets/cards/goal-5-front.webp";
import Card5Back from "../assets/cards/goal-5-back.webp";
import Card6Front from "../assets/cards/goal-6-front.webp";
import Card6Back from "../assets/cards/goal-6-back.webp";
import Card7Front from "../assets/cards/goal-7-front.webp";
import Card7Back from "../assets/cards/goal-7-back.webp";
import Card8Front from "../assets/cards/goal-8-front.webp";
import Card8Back from "../assets/cards/goal-8-back.webp";
import Card9Front from "../assets/cards/goal-9-front.webp";
import Card9Back from "../assets/cards/goal-9-back.webp";
import Card10Front from "../assets/cards/goal-10-front.webp";
import Card10Back from "../assets/cards/goal-10-back.webp";
import Card11Front from "../assets/cards/goal-11-front.webp";
import Card11Back from "../assets/cards/goal-11-back.webp";
import Card12Front from "../assets/cards/goal-12-front.webp";
import Card12Back from "../assets/cards/goal-12-back.webp";
import Card13Front from "../assets/cards/goal-13-front.webp";
import Card13Back from "../assets/cards/goal-13-back.webp";
import Card14Front from "../assets/cards/goal-14-front.webp";
import Card14Back from "../assets/cards/goal-14-back.webp";
import Card15Front from "../assets/cards/goal-15-front.webp";
import Card15Back from "../assets/cards/goal-15-back.webp";
import Card16Front from "../assets/cards/goal-16-front.webp";
import Card16Back from "../assets/cards/goal-16-back.webp";
import Card17Front from "../assets/cards/goal-17-front.webp";
import Card17Back from "../assets/cards/goal-17-back.webp";

// TODO: Cards need to be converted to svg, need canva premium for that
const CardData = [
    {
        id: 1,
        title: "No Poverty",
        desc: "End poverty in all its forms everywhere.",
        colour: "#EA343E",
        frontImage: {
            path: Card1Front,
            alt: "SDG 1: No Poverty"
        },
        backImage: {
            path: Card1Back,
            alt: "Information about SDG 1"
        },
        learningPath: [
            { id: 1, type: 'activity', title: 'Intro Quiz' },
            { id: 2, type: 'learning', title: 'Read: Poverty Facts' },
            { id: 3, type: 'discussion', title: 'Reflect: Local Impact' },
            { id: 4, type: 'activity', title: 'Simulation: Budgeting' },
            { id: 5, type: 'learning', title: 'Case Study' },
            { id: 6, type: 'discussion', title: 'Group Discussion' },
        ],
    },
    {
        id: 2,
        title: "Zero Hunger",
        desc: "End hunger, achieve food security and improved nutrition and promote sustainable agriculture.",
        colour: "#D2A33B",
        frontImage: {
            path: Card2Front,
            alt: "SDG 2: Zero Hunger"
        },
        backImage: {
            path: Card2Back,
            alt: "Information about SDG 2"
        },
    },
    {
        id: 3,
        title: "Good Health",
        desc: "Ensure healthy lives and promote well-being for all at all ages.",
        colour: "#3E9D52",
        frontImage: {
            path: Card3Front,
            alt: "SDG 3: Good Health and Well-being"
        },
        backImage: {
            path: Card3Back,
            alt: "Information about SDG 3"
        },
    },
    {
        id: 4,
        title: "Quality Education",
        desc: "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.",
        colour: "#C43643",
        frontImage: {
            path: Card4Front,
            alt: "SDG 4: Quality Education"
        },
        backImage: {
            path: Card4Back,
            alt: "Information about SDG 4"
        },
    },
    {
        id: 5,
        title: "Gender Equality",
        desc: "Achieve gender equality and empower all women and girls.",
        colour: "#EE503F",
        frontImage: {
            path: Card5Front,
            alt: "SDG 5: Gender Equality"
        },
        backImage: {
            path: Card5Back,
            alt: "Information about SDG 5"
        },
    },
    {
        id: 6,
        title: "Clean Water & Sanitation",
        desc: "Ensure availability and sustainable management of water and sanitation for all.",
        colour: "#05AFD9",
        frontImage: {
            path: Card6Front,
            alt: "SDG 6: Clean Water and Sanitation"
        },
        backImage: {
            path: Card6Back,
            alt: "Information about SDG 6"
        },
    },
    {
        id: 7,
        title: "Affordable & Clean Energy",
        desc: "Ensure access to affordable, reliable, sustainable and modern energy for all.",
        colour: "#FBBA32",
        frontImage: {
            path: Card7Front,
            alt: "SDG 7: Affordable and Clean Energy"
        },
        backImage: {
            path: Card7Back,
            alt: "Information about SDG 7"
        },
    },
    {
        id: 8,
        title: "Decent Work and Economic Growth",
        desc: "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all.",
        colour: "#923146",
        frontImage: {
            path: Card8Front,
            alt: "SDG 8: Decent Work and Economic Growth"
        },
        backImage: {
            path: Card8Back,
            alt: "Information about SDG 8"
        },
    },
    {
        id: 9,
        title: "Industry, Innovation & Infrastructure",
        desc: "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation.",
        colour: "#F06C26",
        frontImage: {
            path: Card9Front,
            alt: "SDG 9: Industry, Innovation and Infrastructure"
        },
        backImage: {
            path: Card9Back,
            alt: "Information about SDG 9"
        },
    },
    {
        id: 10,
        title: "Reduced Inequalities",
        desc: "Reduce inequality within and among countries.",
        colour: "#E13287",
        frontImage: {
            path: Card10Front,
            alt: "SDG 10: Reduced Inequalities"
        },
        backImage: {
            path: Card10Back,
            alt: "Information about SDG 10"
        },
    },
    {
        id: 11,
        title: "Sustainable Cities & Communities",
        desc: "Make cities and human settlements inclusive, safe, resilient and sustainable.",
        colour: "#F8A13A",
        frontImage: {
            path: Card11Front,
            alt: "SDG 11: Sustainable Cities and Communities"
        },
        backImage: {
            path: Card11Back,
            alt: "Information about SDG 11"
        },
    },
    {
        id: 12,
        title: "Responsible Consumption & Production",
        desc: "Ensure sustainable consumption and production patterns.",
        colour: "#D0903E",
        frontImage: {
            path: Card12Front,
            alt: "SDG 12: Responsible Consumption and Production"
        },
        backImage: {
            path: Card12Back,
            alt: "Information about SDG 12"
        },
    },
    {
        id: 13,
        title: "Climate Action",
        desc: "Take urgent action to combat climate change and its impacts.",
        colour: "#527C4B",
        frontImage: {
            path: Card13Front,
            alt: "SDG 13: Climate Action"
        },
        backImage: {
            path: Card13Back,
            alt: "Information about SDG 13"
        },
    },
    {
        id: 14,
        title: "Life Below Water",
        desc: "Conserve and sustainably use the oceans, seas and marine resources for sustainable development.",
        colour: "#0582BC",
        frontImage: {
            path: Card14Front,
            alt: "SDG 14: Life Below Water"
        },
        backImage: {
            path: Card14Back,
            alt: "Information about SDG 14"
        },
    },
    {
        id: 15,
        title: "Life on Land",
        desc: "Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt and reverse land degradation and halt biodiversity loss.",
        colour: "#4CB153",
        frontImage: {
            path: Card15Front,
            alt: "SDG 15: Life on Land"
        },
        backImage: {
            path: Card15Back,
            alt: "Information about SDG 15"
        },
    },
    {
        id: 16,
        title: "Peace, Justice & Strong Institutions",
        desc: "Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels.",
        colour: "#255C8E",
        frontImage: {
            path: Card16Front,
            alt: "SDG 16: Peace, Justice and Strong Institutions"
        },
        backImage: {
            path: Card16Back,
            alt: "Information about SDG 16"
        },
    },
    {
        id: 17,
        title: "Partnerships for the Goals",
        desc: "Strengthen the means of implementation and revitalize the Global Partnership for Sustainable Development.",
        colour: "#31426C",
        frontImage: {
            path: Card17Front,
            alt: "SDG 17: Partnerships for the Goals"
        },
        backImage: {
            path: Card17Back,
            alt: "Information about SDG 17"
        },
    }
]

export default CardData;