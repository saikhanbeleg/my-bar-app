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

class Player:
    def __init__(self, name, hp):
        self.name = name
        self.hp = hp

    def shoot(self, enemy):
        enemy.hp -= 1

    def heal(self):
        self.hp += 1

    def is_alive(self,):
        return self.hp > 0
p1_player = input("enter your name p1: ")
p1_player_hp = int(input("enter your hp: "))

p2_player = input("enter your name p2: ")
p2_player_hp = int(input("enter your hp p2: "))

p1 = Player(p1_player, p1_player_hp)
p2 = Player(p2_player, p2_player_hp)
player = [p1, p2]
while p1.is_alive() and p2.is_alive():
    attacker = random.choice(player)
    if attacker == p1:
        defender = p2
    else:
        defender = p1
    action = input(f"{attacker.name}, shoot or heal: ")
    if action == "shoot":
        attacker.shoot(defender)
    elif action == "heal":
        attacker.heal()
    else:
        print("invalid action")
print("\ngame over")
if p1.is_alive():
    print("p1 wins")
elif p2.is_alive():
    print("p2 wins")
else:
    print("draw")






    

        







