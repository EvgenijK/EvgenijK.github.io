(() => {
  const article = (title,reference,...paragraphs) => ({title,reference,paragraphs});
  const ARTICLES = {
    race:article("Race","TomeNET Guide · Character creation · Maia",
      "Race defines the character's natural strengths, weaknesses and innate powers. It affects base attributes, hit points, experience requirements and several resistances or abilities that may become available while gaining levels.",
      "Maia are powerful spirits taking physical form. Their development is strongly affected by class, trait and alignment, and some combinations may later transform into a more specialised corrupted or enlightened form."),
    class:article("Class","TomeNET Guide · Character classes · Runemaster",
      "Class determines the main skill progression, combat aptitude and access to spells or techniques. It does not lock every possible skill, but it establishes which paths are efficient and which equipment restrictions matter most.",
      "Runemasters create spells by combining learned runes. Their effectiveness depends on rune skills, intelligence, mana and the chosen combination rather than a fixed conventional spell list."),
    body:article("Body modification","TomeNET Guide · Body modification",
      "Body describes the physical form currently used by the character. Most characters remain in their normal player body, while Mimicry, polymorph effects, fruit-bat form and several special states can replace it.",
      "A changed body may alter attributes, armour interaction, blows, innate attacks, resistances and available powers. The displayed body is therefore distinct from race and class."),
    trait:article("Trait","TomeNET Guide · Character traits",
      "A trait is a permanent specialisation layered on top of race and class. Traits can grant bonuses, penalties, resistances or new development paths and may change how later racial powers behave.",
      "The Enlightened trait represents a Maia aligned with the powers of light. Its exact benefits depend on character development and should be read together with the Maia and class descriptions."),
    mode:article("Character mode","TomeNET Guide · Character modes",
      "Character mode controls major lifetime and interaction rules. Normal, Everlasting, PvP, Soloist, Unworldly and Hellish characters differ in available lives, ghost behaviour, difficulty and compatibility with other characters.",
      "Everlasting characters have unlimited lives and can return after death under the mode's normal resurrection rules. Mode is permanent for the character and also affects trading and grouping compatibility."),
    str:article("Strength (STR)","TomeNET Guide · Attributes · Strength",
      "Strength governs carrying capacity and contributes to melee combat. Heavy weapons, armour and an overloaded inventory become easier to handle as Strength rises.",
      "Values above 18 use Angband notation such as 18/50 or 18/180. Temporary boosts and drained values are shown with distinct terminal colours."),
    int:article("Intelligence (INT)","TomeNET Guide · Attributes · Intelligence",
      "Intelligence is the primary casting attribute for several magical classes and influences mana or spell reliability where the class rules specify it.",
      "Its importance is class-dependent. A high value does not replace the relevant school or rune skill, but works together with those skills."),
    wis:article("Wisdom (WIS)","TomeNET Guide · Attributes · Wisdom",
      "Wisdom supports divine and spiritual forms of magic and is important to classes whose spellcasting is based on insight rather than study.",
      "It can influence mana and casting performance according to class rules and should be considered together with Saving Throw and the relevant magic skills."),
    dex:article("Dexterity (DEX)","TomeNET Guide · Attributes · Dexterity",
      "Dexterity contributes to accuracy, defensive agility and many actions requiring precise movement. It is especially relevant to ranged combat, stealing, disarming and flexible fighting styles.",
      "Armour weight and equipment can suppress benefits that would otherwise come from high Dexterity."),
    con:article("Constitution (CON)","TomeNET Guide · Attributes · Constitution",
      "Constitution is the main attribute for physical endurance and maximum hit points. It helps determine how durable a character becomes while gaining levels.",
      "Temporary increases can raise the current maximum, while drained Constitution may sharply reduce survivability until restored."),
    chr:article("Charisma (CHR)","TomeNET Guide · Attributes · Charisma",
      "Charisma represents presence and force of personality. It is used by selected classes, powers and social or magical effects rather than serving as a universal combat statistic.",
      "Its practical value depends strongly on the chosen character build and available abilities."),
    fighting:article("Fighting","TomeNET Guide · Miscellaneous abilities · Fighting",
      "Fighting is the qualitative summary of melee accuracy. The description ranges through named grades and combines skill progression with current character bonuses.",
      "Weapon suitability, dual wielding, encumbrance and temporary effects can all change the effective result even when the underlying skill is unchanged."),
    bows:article("Bows / Throw","TomeNET Guide · Miscellaneous abilities · Bows/Throw",
      "Bows/Throw summarises accuracy with launchers and thrown objects. It is affected by the appropriate ranged skills, Dexterity, equipment bonuses and penalties from an unsuitable shooter or shield.",
      "The value describes accuracy, while Shots/Round separately describes attack speed."),
    saving:article("Saving Throw","TomeNET Guide · Miscellaneous abilities · Saving Throw",
      "Saving Throw is the chance to resist many hostile magical or mental effects. A successful save can prevent or reduce effects that are not already blocked by a specific resistance.",
      "It is not a replacement for elemental resistances, Free Action or confusion protection; each defence applies to its own set of threats."),
    stealth:article("Stealth","TomeNET Guide · Miscellaneous abilities · Stealth",
      "Stealth reduces the chance that nearby monsters notice the character. Moving, attacking and noisy equipment or effects can still reveal the player.",
      "Heavy or rigid armour may reduce Stealth and can also disable class abilities that depend on flexible movement."),
    perception:article("Perception","TomeNET Guide · Miscellaneous abilities · Perception",
      "Perception represents the ability to notice hidden features and dangers without deliberately searching every turn.",
      "It works alongside Searching: Perception concerns awareness, while Searching controls active discovery attempts and related frequency."),
    searching:article("Searching","TomeNET Guide · Miscellaneous abilities · Searching",
      "Searching measures active detection of traps, secret doors and other concealed features. Search mode repeatedly performs this activity while moving more cautiously.",
      "Some classes or abilities improve area searching, and sufficiently strong detection can reveal common hazards with little delay."),
    disarming:article("Disarming","TomeNET Guide · Miscellaneous abilities · Disarming",
      "Disarming determines how reliably the character handles traps and certain locks. Dexterity, skill investment and the difficulty of the device all contribute to the attempt.",
      "Failure may leave the obstacle intact or trigger it, so dangerous traps should not be treated as harmless merely because they are visible."),
    device:article("Magic Device","TomeNET Guide · Magic devices, skill and ability",
      "Magic Device controls the chance to use wands, staves, rods and other magical devices successfully. Item level and device difficulty are considered together with the character's ability.",
      "A failed attempt normally does not consume a charge. Anti-magic can disrupt the attempt independently, and Antistatic Wrapping requires sufficient Magic Device or Trapping skill."),
    blows:article("Blows / Round","TomeNET Guide · Combat speed · Blows per round",
      "Blows/Round is the number of melee attacks performed in one normal combat round. Weapon weight, Strength, Dexterity, class and weapon skill contribute to the result.",
      "The displayed value can also be replaced by special movement states such as Wraithstep or Probability Travel when the classic status presentation needs that space."),
    shots:article("Shots / Round","TomeNET Guide · Combat speed · Shots per round",
      "Shots/Round is the number of missiles that can be fired during a normal round with the equipped launcher. Launcher type, skill and extra-shot bonuses determine the value.",
      "It does not describe accuracy or damage; those are displayed separately in the ranged combat block."),
    infra:article("Infra-Vision","TomeNET Guide · Vision · Infra-vision",
      "Infra-vision detects warm-blooded creatures in darkness within the displayed distance. Ten feet correspond to one map grid in the traditional presentation.",
      "It does not reveal every invisible or cold-blooded creature and is distinct from See Invisible, ESP and ordinary light radius.")
  };

  window.TomeNetPrototype.createGuideWindowFeature = ({$,escapeHtml,windowManager}) => {
    const overlay = $("#guideWindowOverlay");
    const body = $("#guideWindowBody");
    let currentArticle = null;

    function isOpen() { return windowManager.has("guide-article"); }
    function hide() { overlay.hidden = true;overlay.setAttribute("aria-hidden","true");currentArticle = null; }
    windowManager.register({kind:"guide-article",layer:"dialog",blocksGameplay:true,allowsChat:true,focusTarget:() => body,onClose:hide});

    function openArticle(id,opener = document.activeElement) {
      const entry = ARTICLES[id];
      if (!entry) return false;
      currentArticle = id;
      $("#guideWindowTitle").textContent = entry.title.toUpperCase();
      $("#guideWindowReference").textContent = entry.reference;
      body.innerHTML = `<h2>${escapeHtml(entry.title)}</h2>${entry.paragraphs.map(text => `<p>${escapeHtml(text)}</p>`).join("")}`;
      body.scrollTop = 0;
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden","false");
      windowManager.push("guide-article",{article:id},{opener});
      requestAnimationFrame(() => body.focus());
      return true;
    }
    function close() { return windowManager.closeKind("guide-article"); }
    function registerArticles(entries) {
      entries.forEach(entry => {
        if (!entry?.id || !entry.title) return;
        ARTICLES[entry.id] = {
          title:entry.title,
          reference:entry.reference || "TomeNET Guide",
          paragraphs:(entry.paragraphs || []).filter(Boolean)
        };
      });
    }
    function handleKeydown(event) {
      if (!isOpen()) return false;
      if (event.key === "Escape") close();
      else if (event.key === "PageDown") body.scrollBy({top:body.clientHeight * .82,behavior:"smooth"});
      else if (event.key === "PageUp") body.scrollBy({top:-body.clientHeight * .82,behavior:"smooth"});
      else if (event.key === "Home") body.scrollTop = 0;
      else if (event.key === "End") body.scrollTop = body.scrollHeight;
      else return true;
      return true;
    }
    $("#guideWindowClose").addEventListener("click",close);
    overlay.addEventListener("click",event => { if (event.target === overlay) close(); });
    return {openArticle,close,isOpen,handleKeydown,hasArticle:id => Boolean(ARTICLES[id]),registerArticles};
  };
})();
