# import random


# class Charactor:
#     def __init__(self, name, health, level):
#         self.name = name
#         self.health = health
#         self.level = level
# class Fighter(Charactor):
#     def attack(self):
#         print(f"warrior attacks \nname: {self.name} \nhealth: {self.health} \nlevel: {self.level}")
# class Mage(Charactor):
#     def attack(self):
#         print(f"warrior attacks \nname: {self.name} \nhealth: {self.health} \nlevel: {self.level}")
# class Hunter(Charactor):
#     def attack(self):
#         print("warrior attacks")
# class Druid(Charactor):
#     def attack(self):
#         print("warrior attacks")
# hero1 = Fighter("Badang", 100, 2)
# hero2 = Mage("zhask", 50, 100)
# hero3 = Hunter("amoun", 100, 40)
# hero1.attack()
# hero2.attack()
# hero3.attack()
# heros = [hero1, hero2, hero3]
# bot = random.choice(heros)
# print(f"bot picked {bot}")
import random


class Character:
    def __init__(self, name, health, level):
        self.name = name
        self.health = health
        self.level = level

    def attack(self):
        damage = random.randint(10 * self.level, 20 * self.level)
        return damage

    def is_alive(self):
        return self.health > 0

    def take_damage(self, damage):
        self.health -= damage
        if self.health < 0:
            self.health = 0


class Fighter(Character):
    def attack(self):
        damage = random.randint(15 * self.level, 25 * self.level)
        print(f"⚔️  {self.name} slashes with a sword!")
        return damage


class Mage(Character):
    def attack(self):
        damage = random.randint(20 * self.level, 35 * self.level)
        print(f"🔮 {self.name} casts a spell!")
        return damage


class Hunter(Character):
    def attack(self):
        damage = random.randint(12 * self.level, 22 * self.level)
        print(f"🏹 {self.name} shoots an arrow!")
        return damage


class Druid(Character):
    def attack(self):
        damage = random.randint(10 * self.level, 20 * self.level)
        print(f"🌿 {self.name} summons nature's wrath!")
        return damage


def choose_hero():
    print("=== Choose Your Hero ===")
    print("1. Fighter  ⚔️  (High damage, tanky)")
    print("2. Mage     🔮 (Very high damage, low HP)")
    print("3. Hunter   🏹 (Balanced)")
    print("4. Druid    🌿 (Balanced)")

    classes = {"1": Fighter, "2": Mage, "3": Hunter, "4": Druid}

    while True:
        choice = input("Pick your class (1-4): ").strip()
        if choice in classes:
            name = input("Enter your hero's name: ").strip()
            hero_class = classes[choice]
            return hero_class(name, health=200, level=5)
        print("Invalid choice, try again.")


def choose_bot():
    bot_names = {
        Fighter: "Badang",
        Mage: "Zhask",
        Hunter: "Amoun",
        Druid: "Sylva"
    }
    bot_class = random.choice([Fighter, Mage, Hunter, Druid])
    bot_name = bot_names[bot_class]
    return bot_class(bot_name, health=200, level=5)


def battle(player, bot):
    print(f"\n⚔️  BATTLE START: {player.name} vs {bot.name}! ⚔️\n")

    while player.is_alive() and bot.is_alive():
        print(f"❤️  Your HP: {player.health}  |  🤖 {bot.name} HP: {bot.health}")
        print("-" * 40)

        action = input("Your turn! Press [A] to Attack or [Q] to Quit: ").strip().lower()

        if action == "q":
            print("You fled the battle. Coward! 🏃")
            break
        elif action == "a":
            # Player attacks bot
            dmg = player.attack()
            bot.take_damage(dmg)
            print(f"   💥 You dealt {dmg} damage! {bot.name} has {bot.health} HP left.\n")

            if not bot.is_alive():
                print(f"🏆 You defeated {bot.name}! YOU WIN!")
                break

            # Bot attacks player
            print(f"🤖 {bot.name}'s turn!")
            bot_dmg = bot.attack()
            player.take_damage(bot_dmg)
            print(f"   💥 {bot.name} dealt {bot_dmg} damage! You have {player.health} HP left.\n")

            if not player.is_alive():
                print(f"💀 You were defeated by {bot.name}. GAME OVER.")
                break
        else:
            print("Invalid input! Type A to attack or Q to quit.\n")


# --- MAIN ---
player = choose_hero()
bot = choose_bot()
print(f"\n🤖 Bot picked: {bot.__class__.__name__} - {bot.name}")
battle(player, bot)