// Furniture from other programs: the built-in type for a type name or a piece's name (English,
// and the common words in German, French, Spanish, Italian and Dutch).
import { FURNITURE } from "../scene/furniture-lib";

/** Type names other programs use for one of ours. */
const ALIASES: Record<string, string> = {
  sofa_u: "sofa_l", corner_bench: "bench", bar_stool: "stool_bar", worktop: "kitchen", stairs_u: "stairs",
  lamp_spot: "lamp_spots", lamp_panel: "lamp_ceiling", bathtub: "bathtub", toilet: "wc", oven: "kitchen_tall",
  cooker: "stove", hob: "stove", tv: "tv_board", bookshelf: "bookcase", cupboard: "tall_cabinet", box: "column",
};

/** What a piece is for picking among a type's sizes. */
export interface PieceInfo {
  w?: number;
  h?: number;
  /** Bottom above the floor (m). */
  elevation?: number;
  /** The storey's height (m): lights near the ceiling hang from it. */
  storey?: number;
  light?: boolean;
}

// first match wins, so the specific names come before the general ones
const NAMES: [RegExp, string | ((p: PieceInfo) => string)][] = [
  [/door|window|fenetre|fenster|tur\b/, ""],
  [/curtain|blind|vorhang|rideau/, ""],
  [/chandelier|lustre|kronleuchter/, "lamp_chandelier"],
  [/pendant|hanging lamp|suspension|pendel|hangelampe/, "lamp_pendant"],
  [/downlight|recessed/, "lamp_downlight"],
  [/wall (lamp|light|uplight)|sconce|wandleuchte|wandlampe|applique/, "lamp_wall"],
  [/floor lamp|standard lamp|uplight|stehlampe|lampadaire/, "lamp_floor"],
  [/table lamp|desk lamp|work lamp|bedside lamp|tischlampe|nachttischlampe|lampe de chevet/, "lamp_table"],
  [/ceiling (lamp|light)|deckenleuchte|deckenlampe|plafonnier/, "lamp_ceiling"],
  [/spot/, "lamp_spots"],
  [/led strip|light strip/, "led_strip"],
  [/lamp|light|leuchte|lampe|lampara|lampada/, (p) => lampFor(p)],
  [/corner sofa|l-?shaped sofa|sectional|ecksofa|canape d'angle|divano angolare/, "sofa_l"],
  [/two.?seat|2.?seat|loveseat/, "sofa_2"],
  [/sofa|couch|settee|canape|divano/, "sofa"],
  [/recliner/, "recliner"],
  [/armchair|easy chair|fauteuil|sessel|poltrona|sillon/, "armchair"],
  [/bunk|loft bed|etagenbett|superpose|litera/, "bunk_bed"],
  [/crib|\bcot\b|cradle|baby bed|kinderbett|berceau|culla/, "cot"],
  [/bedside|night ?stand|night table|nachttisch|chevet|comodino|mesita/, "nightstand"],
  [/\bbed\b|\bbett\b|\blit\b|\bcama\b|\bletto\b/, (p) => ((p.w ?? 1.4) < 1.15 ? "bed_single" : (p.w ?? 1.4) >= 1.75 ? "bed_king" : "bed")],
  [/wardrobe|closet|armoire|kleiderschrank|armadio|guardarropa|kledingkast|sliding doors/, "wardrobe"],
  [/dressing table|vanity table|coiffeuse/, "dressing_table"],
  [/chest|dresser|commode|kommode|comoda|cassettiera/, "dresser"],
  [/display cabinet|glass.?door cabinet|vitrine|vitrina|vetrina/, "display_cabinet"],
  [/bookcase|bookshelf|bucherregal|bibliotheque|libreria|boekenkast/, "bookcase"],
  [/shelf|shelves|shelving|regal|etagere|estanteria|scaffale/, "shelf"],
  [/sideboard|buffet|credenza|anrichte|aparador/, "sideboard"],
  [/tv unit|tv stand|tv cabinet|tv bench|media unit|meuble tv|tv-?mobel/, "tv_board"],
  [/\btv\b|television|fernseher|tele\b|televisor|televisore/, (p) => ((p.elevation ?? 0) > 0.5 ? "tv_wall" : "tv_board")],
  [/coffee table|couchtisch|table basse|tavolino|mesa de centro|salontafel/, "coffee_table"],
  [/side table|end table|beistelltisch|bout de canape/, "side_table"],
  [/office chair|desk chair|swivel|burostuhl|chaise de bureau/, "office_chair"],
  [/desk|bureau|schreibtisch|escritorio|scrivania/, "desk"],
  [/bar stool|barstool|counter stool|barhocker|tabouret de bar/, "stool_bar"],
  [/stool|hocker|tabouret|taburete|sgabello|kruk/, "stool"],
  [/high ?chair|hochstuhl|chaise haute|trona/, "high_chair"],
  [/bench|\bbanc\b|\bbanco\b|panca/, "bench"],
  [/chair|stuhl|chaise|silla|sedia|stoel/, "chair"],
  [/round table|table ronde|runder tisch|mesa redonda|tavolo rotondo/, "table_round"],
  [/island|kochinsel|ilot|isla/, "island"],
  [/bath ?tub|\bbath\b|baignoire|badewanne|banera|vasca/, "bathtub"],
  [/shower|dusche|douche|ducha|doccia/, "shower"],
  [/toilet|\bwc\b|lavatory|\bloo\b|inodoro/, "wc"],
  [/basin|lavabo|waschbecken|wastafel|bathroom sink|vanity/, "washbasin"],
  [/towel/, "towel_rail"],
  [/american fridge|side.?by.?side/, "fridge_american"],
  [/fridge|refrigerator|freezer|kuhlschrank|refrigerateur|frigo|nevera|frigorifero|koelkast/, (p) => ((p.w ?? 0.6) > 0.8 ? "fridge_american" : "fridge")],
  [/dishwasher|geschirrspuler|spulmaschine|lave-vaisselle|lavavajillas|lavastoviglie|vaatwasser/, "dishwasher"],
  [/washing machine|clothes washer|washer|waschmaschine|lave-linge|lavadora|lavatrice|wasmachine/, "washer"],
  [/dryer|trockner|seche-linge|secadora|asciugatrice|droger/, "dryer"],
  [/wood ?burner|log burner|wood stove|kaminofen|poele/, "stove_wood"],
  [/fireplace|kamin|cheminee|chimenea|camino/, "fireplace"],
  [/oven|backofen|\bfour\b|horno|forno/, (p) => ((p.h ?? 0.6) > 1.2 ? "kitchen_tall" : "stove")],
  [/cooker|stove|\brange\b|\bhob\b|\bherd\b|cuisiniere|cocina|fornello|kookplaat/, "stove"],
  [/sink|spule|evier|fregadero|lavello|gootsteen/, "sink"],
  [/upper cabinet|wall cabinet|wall cupboard|wall unit|hangeschrank|meuble haut/, "kitchen_wall"],
  [/tall unit|larder|pantry|hochschrank/, "kitchen_tall"],
  [/kitchen|base unit|worktop|countertop|kuche|cuisine|unterschrank|meuble bas/, "kitchen"],
  [/cabinet|cupboard|schrank|placard|armario/, (p) => ((p.h ?? 2) >= 1.3 ? "tall_cabinet" : (p.elevation ?? 0) > 1 ? "kitchen_wall" : "sideboard")],
  [/table|tisch|mesa|tavolo|tafel/, "table"],
  [/radiator|heater|heizkorper|radiateur|radiador|termosifone/, "radiator"],
  [/boiler|chaudiere|caldera/, "boiler"],
  [/piano|klavier/, "piano"],
  [/aquarium|acquario|acuario/, "aquarium"],
  [/christmas tree|weihnachtsbaum|sapin/, "christmas_tree"],
  [/palm/, "plant_palm"],
  [/cactus|kaktus/, "cactus"],
  [/flower|bouquet|blumen|fleurs|flores|fiori/, "flowers"],
  [/hedge|hecke|haie/, "hedge"],
  [/shrub|bush|strauch|arbuste/, "shrub"],
  [/conifer|fir\b|pine/, "tree_conifer"],
  [/tree|baum|arbre|arbol|albero/, "tree"],
  [/plant|pflanze|plante|planta|pianta/, "plant"],
  [/rug|carpet|teppich|tapis|alfombra|tappeto|vloerkleed/, "rug"],
  [/mirror|spiegel|miroir|espejo|specchio/, "mirror"],
  [/clock|\buhr\b|horloge|reloj|orologio/, "clock"],
  [/picture|painting|frame|poster|artwork|\bbild\b|tableau|cuadro|quadro|schilderij/, "picture"],
  [/coat|garderobe|portemanteau|perchero|appendiabiti/, "coat_rack"],
  [/shoe/, "shoe_rack"],
  [/laptop/, "laptop"],
  [/monitor|computer|screen/, "monitor"],
  [/stair|treppe|escalier|escalera|scala|trap\b/, "stairs"],
  [/column|pillar|saule|colonne|columna|colonna/, "column"],
  [/bicycle|bike|fahrrad|velo|bicicleta/, "bicycle"],
  [/treadmill|laufband/, "treadmill"],
  [/\bcar\b|\bauto\b|voiture|coche/, "car"],
  [/guitar|gitarre|guitare|chitarra/, "guitar"],
  [/\bbin\b|trash|waste|mulleimer|poubelle|papelera/, "bin"],
  [/vase/, "vase"],
  [/books/, "books"],
];

/** A lamp by where it is: near the ceiling it hangs from it, on furniture it stands on it, else on the floor. */
function lampFor(p: PieceInfo): string {
  const top = (p.elevation ?? 0) + (p.h ?? 0.4);
  if (p.storey && top > p.storey - 0.4) return "lamp_ceiling";
  if ((p.elevation ?? 0) > 1.2) return "lamp_wall";
  if ((p.elevation ?? 0) > 0.3 || (p.h ?? 1) < 0.8) return "lamp_table";
  return "lamp_floor";
}

/** "Kühlschrank" -> "kuhlschrank". */
const plain = (s: string): string => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * The built-in furniture type for a type or name, or null when none fits. "" (from a door, a window
 * or a curtain) means it is not furniture at all.
 */
export function furnitureFor(name: string, p: PieceInfo = {}): string | null {
  const key = plain(name).trim().replace(/[\s-]+/g, "_");
  if (FURNITURE[key]) return key;
  if (ALIASES[key]) return ALIASES[key];
  const text = plain(name).replace(/[_#]/g, " ");
  for (const [re, type] of NAMES) {
    if (re.test(text)) return typeof type === "string" ? type : type(p);
  }
  return p.light ? lampFor(p) : null;
}
