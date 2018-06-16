// Question: Is HP, AP & CAP randomized for each player?
// 4 players
// each player will have healthPoint, attackPower, counterAttackPower, baseAttackPower
// player role. attacker, defender
// attacker uses AP. Defender uses CAP
// health point 50 - 100
// AP & CAP 10 - min. of HP range
 
// To make sure changing constant gives error
"use strict";

$(document).ready(function() {
// VIK_DEBUG: Remove following call later on
    initGame();
})
 
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
// The current defender
var theDefender;
// list of all the defender that were defeated
var defeatedList = [];

function initGlobal() {
    playerList = [];
    defeatedList = [];
    currentPlayer = null;
    theDefender = null;
}

function initGame()
{
    initGlobal();

    disableAttackBtn(true);

    buildPlayers(playerList);
    console.log(playerList);
    // console.assert(userChosenPlayer < playerList.length, "Player list is not built properly");
    // console.assert(userChosenDefender < playerList.length, "Player list is not built properly");
    // console.assert(userChosenDefender !== userChosenPlayer, "Player and defender can't be same");
    // currentPlayer = playerList[userChosenPlayer];
    // currentDefender = playerList[userChosenDefender];

    for (let i = 0; i < playerList.length; ++i) {
        let ply = playerList[i];
        let imgFullPath = IMG_PATH + "/" + ply.avatarImg;

        let colNode = $("<div>");
        $(colNode).addClass("col border player-col");
        // $(colNode).attr("id", "player"+i);

        let divPlayerTopNode = $("<div>").attr("id", "player" + i);
        divPlayerTopNode.attr("ondrop", "dragDrop.drop(event)");
        divPlayerTopNode.attr("ondropover", "dragDrop.allowDrop(event)");

        let divPlayer = $("<div>");
        divPlayer.attr("class", "text-sm-vk text-center player-node");
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
    }
}

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
    let avatars = AVATAR_LIST.slice();
    for (let i = 0; i < avatars.length; ++i)
        players.push( createPlayer(avatars[i]) );
}
 
function attackCounterAttack() {
    console.assert(currentPlayer !== null, "Player is not valid");
    console.assert(theDefender !== null, "defender is not valid");

    let playerPower = currentPlayer.attackPower;
    let defenderPower = theDefender.attackPower;
    let defenderName = theDefender.avatarName;

    attack(); 
    if (theDefender !== null) {
        counterAttack();
        updateHealthPoint(theDefender);
    }
    updateHealthPoint(currentPlayer);

    displayMsgToUser(playerPower, defenderPower, defenderName);
    
}

function displayMsgToUser(playerPower, defenderPower, defenderName) {
    let msg;
    if ( hasPlayerWon() ) {
        msg = "You Win!!!";
    }
    else if (currentPlayer.healthPoint <= 0) {
        msg = "Sorry, you lost.";
    }
    else if (theDefender === null) {
        msg = defenderName + " was defeated. Pick the next one";
    }
    else {
        msg = "You attacked with " + playerPower + " power. ";
        msg += defenderName + " counter-attacked you with " + defenderPower + " power.";
    }

    msgToUser(msg);
}

function msgToUser(msg)
{
    $(document).find(".user-msg").text(msg);
}

function attack()
{
    console.assert(currentPlayer !== null , "Player is not selected");
    console.assert(theDefender !== null , "Defender is not selected");
    console.assert(currentPlayer !== theDefender , "Both player and defender are same!");
    console.assert(theDefender.healthPoint > 0 , "Defender health point should be greater than 0");
    console.assert(currentPlayer.attackPower > 0, "Player attack power should be greater than 0");
    console.assert(currentPlayer.baseAttackPower > 0, "Player base attack power should be greater than 0");
 
    theDefender.healthPoint -= currentPlayer.attackPower;
    if (theDefender.healthPoint <= 0) {
        moveToDefeated(theDefender);
    }
    
    currentPlayer.attackPower += currentPlayer.baseAttackPower;
}
 
function counterAttack()
{
    console.assert(currentPlayer !== null , "Player is not selected");
    console.assert(theDefender !== null , "Defender is not selected");
    console.assert(currentPlayer !== theDefender , "Both player and defender are same!");
    console.assert(currentPlayer.healthPoint > 0 , "Player health point should be greater than 0");
    console.assert(theDefender.attackPower > 0, "Defender attack power should be greater than 0");
 
    currentPlayer.healthPoint -= theDefender.attackPower;
    if (currentPlayer.healthPoint <= 0) {
     playerLose();  
    }
   
}
 
function moveToDefeated(defender)
{
    defeatedList.push(defender);
    theDefender = null;
    
    $("#defender").removeClass("defender-ui").find(".player-node").detach();
    if ( hasPlayerWon() )
        playerWin();
}

function hasPlayerWon() {
    // In player list all except one are the defenders
    return ( defeatedList.length == playerList.length - 1 );
}
 
function playerLose()
{
    disableAttackBtn(true);
    displayRestart();
}
 
function playerWin()
{
    disableAttackBtn(true);
    displayRestart();
}

function displayRestart()
{
    var btn = $("<button>").attr("class", "restart-btn btn btn-secondary btn-sm");
    btn.attr("type", "button");
    btn.text("Restart");
    btn.on("click", function() {
        // VIK_TODO: Don't use reload. Instead clean up DOM
        // $(this).remove();
        // initGame();

        location.reload();
    });

    $(document).find(".restart").append(btn);
}

function disableAttackBtn(shouldDisable)
{
    $(".attack-btn").prop("disabled", shouldDisable);
}
 
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

        if (data !== "") {
            // VIK_QUESTION: How in JS object passed as param can be changed in function?
            // VIK_TODO: Allow changing the player in beginning of the game
            if (currentPlayer === null && ev.target.id === "your-character") {
                currentPlayer = getPlayer(data);
                $(ev.target).append($(document).find("#"+data)).addClass("player-ui");

            }
            if (theDefender === null && ev.target.id === "defender") {
                theDefender = getPlayer(data); 
            $(ev.target).append($(document).find("#"+data)).addClass("defender-ui");
        }

            startGame();
        } 
    }
}

// Returns the player object of the input player id
function getPlayer(playerId) {
        let player;
    // if (ev.target.id === targetId) {
        for (let i = 0; i < playerList.length; ++i) {
            if (playerList[i].id === playerId) {
                player = playerList[i];
                break;
            }
        }
    // } 

    return player;   
}

function startGame() {
    if (currentPlayer !== null && theDefender !== null) {
        // VIK_TODO: This should be done only once for each game

        // search all-characters-row to find remaining players using
        // the class "player-node" 
        // detach them and append them to "enemies-available"
        let enemies = $("#all-characters-row").find(".player-col");
        for (let i = 0; i < enemies.length; ++i) {
            let enemy = $(enemies[i]).detach();
            // If it's not an empty node
            if (enemy.find(".player-node").length !== 0)
                enemy.appendTo("#enemies-available");
        }

        disableAttackBtn(false);
    }
}

function buildHealthDivId(player)
{
    return player.id + "-hp";
}

function updateHealthPoint(player) {
    $("#"+buildHealthDivId(player)).text(player.healthPoint);
}

$(document).on("click", ".attack-btn", function() {
    attackCounterAttack();
})

$(document).on("dblclick", ".player-col", function() {
    let node = $(this).find(".player-node");

    if (currentPlayer === null) {
        $(this).detach();
        currentPlayer = getPlayer(node.attr("id"));
      $(document).find("#your-character").append(node).addClass("player-ui");
      }
    else if (theDefender === null) {
        $(this).detach();
        theDefender = getPlayer(node.attr("id"));
        $(document).find("#defender").append(node).addClass("defender-ui");

    }
    startGame();
})

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
