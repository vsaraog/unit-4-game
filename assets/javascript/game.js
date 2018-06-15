// Question: Is HP, AP & CAP randomized for each player?
// 4 players
// each player will have healthPoint, attackPower, counterAttackPower, baseAttackPower
// player role. attacker, defender
// attacker uses AP. Defender uses CAP
// health point 50 - 100
// AP & CAP 10 - min. of HP range
 
// To make sure changing constant gives error
"use strict";
 
const HEALTH_POINT = {
    min: 100,
    max: 200,
};
Object.freeze(HEALTH_POINT);

 
const ATTACK_RANGE = {
    min: 10,
    max: HEALTH_POINT.min/2,
    };
Object.freeze(ATTACK_RANGE);
 
const COUNTER_ATTACK_RANGE = {
    min: ATTACK_RANGE.max,
    max: ATTACK_RANGE.max * 2,
}
Object.freeze(COUNTER_ATTACK_RANGE);

const IMG_PATH = "assets/images"
const AVATAR_LIST = [
    { name:"Obi-Wan Kenobi",         img:"obi-wan.jpeg", id: "obi-wan" },
        { name: "Luke Skywalker",         img: "luke-skywalker.jpeg", id: "luke-sky" },
        {name: "Darth Sidious",        img: "darth-sidious.jpeg", id: "darth-sid"},
        {name: "Darth Maul",    img:"darth-maul.jpeg", id: "darth-maul"}];

Object.freeze(AVATAR_LIST);
 
// All the characters in the game
var playerList = [];
// The character that the user has chosen
var currentPlayer;
var currentDefender;
var defenderList = [];
var defeatedList = [];
 
function randomNumGenerator(min, max, roundToNearest)
{
    let num = ( min + Math.round(Math.random() * (max-min) ) );
    return ( Math.round(num/roundToNearest) * roundToNearest );
}

function Player(hp, ap, cap, avt) 
{
    this.healthPoint = hp;
    // Make following properties non-writable, non-configurable
    Object.defineProperty( this, 'counterAttackPower', {value: cap} );
    Object.defineProperty( this, 'baseAttackPower', {value: ap} );
    Object.defineProperty( this, 'avatarName', {value: avt.name} );
    Object.defineProperty( this, 'avatarImg', {value: avt.img} );
    Object.defineProperty( this, 'id', {value: avt.id} );
    
    this.attackPower = this.baseAttackPower;
}
 
// Creates a player and returns it
function createPlayer(avatar)
{
    // Just aliases
    let minHP = HEALTH_POINT.min;
    let maxHP = HEALTH_POINT.max;
    let minAP = ATTACK_RANGE.min;
    let maxAP = ATTACK_RANGE.max;
    let minCAP = COUNTER_ATTACK_RANGE.min;
    let maxCAP = COUNTER_ATTACK_RANGE.max;
    let rand = randomNumGenerator;
 
    return new Player(
        rand(minHP, maxHP, 10),     // Health Point
        rand(minAP, maxAP, 5),      // Attack Power
        rand(minCAP, maxCAP, 5),    // Couter Attack Power
        avatar
        );
}
 
// Builds all the players of the game
function buildPlayers(players)
{
    //let avatars = getAvatarsRandomize(AVATAR_LIST);
    let avatars = AVATAR_LIST.slice();
    for (let i = 0; i < avatars.length; ++i)
        players.push( createPlayer(avatars[i]) );
}
 
function attack()
{
    console.assert(currentPlayer !== undefined , "Player is not selected");
    console.assert(currentDefender !== undefined , "Defender is not selected");
    console.assert(currentPlayer !== currentDefender , "Both player and defender are same!");
    console.assert(currentDefender.healthPoint > 0 , "Defender health point should be greater than 0");
    console.assert(currentPlayer.attackPower > 0, "Player attack power should be greater than 0");
    console.assert(currentPlayer.baseAttackPower > 0, "Player base attack power should be greater than 0");
 
    currentDefender.healthPoint -= currentPlayer.attackPower;
    if (currentDefender.healthPoint <= 0) {
        // @todo: Put in the defeated list
        moveToDefeated(currentDefender);
        }
       
    currentPlayer.attackPower += currentPlayer.baseAttackPower;
}
 
function counterAttack()
{
    console.assert(currentPlayer !== undefined , "Player is not selected");
    console.assert(currentDefender !== undefined , "Defender is not selected");
    console.assert(currentPlayer !== currentDefender , "Both player and defender are same!");
    console.assert(currentPlayer.healthPoint > 0 , "Player health point should be greater than 0");
    console.assert(currentDefender.attackPower > 0, "Defender attack power should be greater than 0");
 
    currentPlayer.healthPoint -= currentDefender.attackPower;
    if (currentPlayer.healthPoint <= 0) {
     playerLose();  
    }
   
}
 
function moveToDefeated(defender)
{
    defeatedList.push(defender);
    if (defenderList.length == 0)
        playerWin();
}
 
function playerLose()
{
}
 
function playerWin()
{
}

 
function initGame()
{
    $("#attack").prop("disabled", true);

    playerList = [];
    buildPlayers(playerList);
    console.log(playerList);
    // let userChosenPlayer = 0; // VIK_TODO: Change to the one that user picked
    // let userChosenDefender = 1; // VIK_TODO: Change to the one that user picked
    // console.assert(userChosenPlayer < playerList.length, "Player list is not built properly");
    // console.assert(userChosenDefender < playerList.length, "Player list is not built properly");
    // console.assert(userChosenDefender !== userChosenPlayer, "Player and defender can't be same");
    // currentPlayer = playerList[userChosenPlayer];
    // currentDefender = playerList[userChosenDefender];

    defenderList = [];
    for (let i = 0; i < playerList.length; ++i) {
        let ply = playerList[i];
        let imgFullPath = IMG_PATH + "/" + ply.avatarImg;

        let colNode = $("<div>");
        $(colNode).addClass("col border");
        // $(colNode).attr("id", "player"+i);

        let divPlayerTopNode = $("<div>").attr("id", "player" + i);
        divPlayerTopNode.attr("ondrop", "dragDrop.drop(event)");
        divPlayerTopNode.attr("ondropover", "dragDrop.allowDrop(event)");

        let divPlayer = $("<div>");
        divPlayer.attr("class", "player-node text-sm-vk");
        divPlayer.attr("id", ply.id);
        divPlayer.attr("draggable", "true");
        divPlayer.attr("ondragstart", "dragDrop.drag(event)");
        divPlayerTopNode.append(divPlayer);

        let divName = $("<div>");
        divName.text(ply.avatarName);
        divPlayer.append(divName);
        
        let divImg = $("<div>");
        $(divImg).html("<img class=\"img-vk\" src="+ imgFullPath + ">");
        divPlayer.append(divImg);

        let divHp = $("<div>");
        divHp.attr("id", buildHealthDivId(ply));
        $(divHp).text(ply.healthPoint);
        divPlayer.append(divHp);

        colNode.append(divPlayerTopNode);
        $("#all-characters-row").append(colNode);
        

        // if (i !== userChosenPlayer && i != userChosenDefender)
        //     defenderList.push(playerList[i]);
    }
    defeatedList = [];
}

// $(window).on("load", function() {
$(document).ready(function() {
// VIK_DEBUG: Remove following call later on
initGame();
})

var dragDrop = {
    allowDrop: function(ev) {
        ev.preventDefault();
    },
    
    drag: function(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    },
    
     drop: function(ev) {
        ev.preventDefault();
        let data = ev.dataTransfer.getData("text");

        let getDroppedPlayer = function(targetId) {
            let player;
            if (ev.target.id === targetId) {
                for (let i = 0; i < playerList.length; ++i) {
                    if (playerList[i].id === data) {
                        player = playerList[i];
                        break;
                    }
                }
            } 

            return player;   
        }

        if (data !== "") {
            ev.target.appendChild(document.getElementById(data));
            // VIK_QUESTION: How in JS object passed as param can be changed in function?
            // VIK_TODO: Allow changing the player in beginning of the game
            if (currentPlayer === undefined) {
             currentPlayer = getDroppedPlayer("your-character")
            }
            if (currentDefender === undefined) {
                currentDefender = getDroppedPlayer("defender"); 
            }

            if (currentPlayer !== undefined && currentDefender !== undefined) {
                // VIK_TODO: This should be done only once for each game
                readyToPlay();
            }
        } 
    }
}

function readyToPlay() 
{
    console.assert(currentPlayer !== undefined, "Current player is not set");
    console.assert(currentDefender !== undefined, "Defender is not set");

    // search all-characters-row to find remaining players using
    // the class "player-node" 
    // detach them and append them to "enemies-available"
    let enemies = $("#all-characters-row").find(".player-node");
    for (let i = 0; i < enemies.length; ++i) {
        let enemy = enemies[i].detach();
        $("enemies-available").append(enemy);
    }

    $("#attack").prop("disabled", false);
}

function buildHealthDivId(player)
{
    return player.id + "-hp";
}

function updateHealthPoint(player) {
    $("#"+buildHealthDivId(player)).text(player.healthPoint);
}

// VIK_QUESTION: Why $("#attack").on("click", ...) is not working
$(document).on("click", "#attack", function() {
    console.log("In attack");
    attack();
    counterAttack();
    updateHealthPoint(currentPlayer);
    updateHealthPoint(currentDefender);
})

// $(document).on("mouseenter", "#attack", function() {
//     let disable = (currentPlayer === undefined || currentDefender === undefined);
//     $(this).prop("disabled", disable);
// })
// $(document).on("click", "#attack", function() {
//     console.log("clicked button");
// })

// drag and drop player to "your-character"
// drag and drop a player to defenders location
//  - When both player and defender are set then
//  move remaining players to "enemies-available"
// - enable the attack button
// Once game started don't allow dragging from player
// and defender region

// EXTRA - Later allow changing player and defender by 
// dragging and dropping them back

// If player defeats the defender
// - move the defender to defeated zone
// - empty the defender area
// - allow drag and drop again for defender

// if player wins against all defenders
// increase win count
// init state of the game

// if defender wins against the player
// increase loss count
// init state of the game

// VIK_TODO: Allow to change player at the start
// VIK_TODO: Initialize the state when attacker & defender are set
// i.e. defender list, attack button etc