//starts with no players
let players = [];
let collapsed = [];

//to act as a struct
function Player(name, constraints, index){
    this.sorted = false;
    this.index = index;
    this.name = name;
    this.constraints = constraints; //array of Player objects
    this.receiver; //Player object
}

function ValidTextCheck(string){
    if (string.trim() == ""){
        return false;
    }

    return true;
}

function AddPlayer() {
    let name = document.querySelector("#new-player").value;
    console.log("adding player...\nInput says "+ name);
    
    if (!ValidTextCheck(name)){
        alert("Please enter a valid input");
        return;
    }

    //find double ups
    for (let i = 0; i < players.length; i++){
        if (players[i].name === name){
            alert("This name already exists. Please pick another.");
            return;
        }
    }
    //if no double ups, add player to array
    let newPlayer = new Player(name, [], players.length);
    AddConstraint(newPlayer, newPlayer); //so it can't pick itself
    players.push(newPlayer);

    //draw new player
    DrawNewPlayer(players.length-1);
    UpdateDrawPlayer();
}

function DrawNewPlayer(index){
    let player = players[index];

    //draw box
    let parent = document.createElement("div");
    parent.className = "box";
    parent.addEventListener('dblclick', function() {
        ToggleFlip(parent);
    });
    //card deets, for flipping
    let cardInner = document.createElement("div");
    cardInner.className = "card-inner";
    let cardFront = document.createElement("div");
    cardFront.className = "card-front";
    let cardBack = document.createElement("div");
    cardBack.className = "card-back";
    //draw title (name)
    let name = document.createElement("h1");
    name.className = "player-name";
    //draw div that will hold form for constraints
    let constraints = document.createElement("div");
    constraints.className = "player-constraints";

    //draw text that will eventually hold receiver
    let receiver = document.createElement("h4");
    receiver.className = "player-receiver";
    let gifteeName = document.createElement("h1");
    gifteeName.className = "player-giftee-name";

    let helpText = document.createElement("h3");
    helpText.className = "player-help";
    helpText.textContent = "Press 'SORT!' to set a giftee";

    //draw remove button
    let removeButton = document.createElement("button");
    removeButton.className = "player-remove";
    removeButton.textContent = "X";
    removeButton.onclick = function () {
        RemovePlayer(player)
    };

    //append to front 
    cardFront.appendChild(CreateBreak());
    cardFront.appendChild(name);
    cardFront.appendChild(CreateBreak());
    cardFront.appendChild(constraints);
    cardFront.appendChild(CreateBreak());
    cardFront.appendChild(removeButton);
    cardFront.appendChild(helpText);
    //append to back
    cardBack.appendChild(receiver);
    cardBack.appendChild(gifteeName);
    //append the card sides to the parent
    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);

    parent.appendChild(cardInner);

    //fill content
    UpdatePlayerDetails(player, parent);

    // append the parent to the body of the document
    document.querySelector(".content").appendChild(parent);
}

function CreateBreak() {
    return document.createElement("br");
}

function ToggleFlip(card) {
    console.log("Card was flipped");
    card.querySelector('.card-inner').classList.toggle('flipped');
}

function UpdateSortedText(player, card){
    let helpText = card.querySelector(".player-help");
    let receiver = card.querySelector(".player-receiver");
    let gifteeName = card.querySelector(".player-giftee-name");

    if (!player.sorted){
        helpText.textContent = "Press 'SORT!' to set a giftee";
        receiver.textContent = "Press 'SORT!' to set a giftee";
        gifteeName.textContent = "";
    } else {
        if (player.receiver != null){
            helpText.textContent = "Double click to flip card!"
            receiver.textContent = player.name + " is giving a present to ";
            gifteeName.textContent = "" + player.receiver.name;
            gifteeName.colour = "var(--secondary-color)"
        } else {
            helpText.textContent = "Unable to set giftee :( "
            receiver.textContent = "Try changing some constraints or sorting again :(";
            gifteeName.textContent = "N/A";
            gifteeName.colour = "var(--third-color)";
        }
    }
}

function DrawConstraintsForm(player){
    let container = document.createElement("div");
    let title = document.createElement("h5");
    let form = document.createElement("form");
    form.style.display = "flex";
    form.style.justifyContent = "flex-start";
    form.style.flexWrap = "wrap";

    //make title
    title.textContent = "Constraints:";
    container.appendChild(title);
    container.appendChild(CreateBreak());

    //create appendiged checkboxes and labels
    let fname;
    for (let i = 0; i < players.length; i++){
        let option = document.createElement("div");
        //option.style.display = "inline";
        option.style.marginRight = "14px";
        option.style.marginBottom = "5px";

        fname = players[i].name;
        //checkboxes
        let finput = document.createElement("input");
        finput.type = "checkbox";
        finput.id = "checkbox-"+fname;
        finput.name = "checkbox-"+fname;
        let isChecked = FindName(player.constraints, players[i].name);
        if (isChecked != -1){
            //this is already constrained
            finput.checked = true;
        } else {
            //this is not constrained
            finput.checked = false;
        }
        //attach event listener
        finput.addEventListener("change", (event) => {
            ConstraintChanged(event, player, players[i]);
        });
        option.appendChild(finput);
        //labels
        let flabel = document.createElement("label");
        flabel.for = "checkbox-"+fname;
        flabel.id = "label-"+fname;
        flabel.textContent = fname;
        option.appendChild(flabel);

        form.appendChild(option);
    }

    container.appendChild(form);

    return container;
}

//update the array of constraints 
function ConstraintChanged(event, player, constraint){
    console.log("Updating constraints of " + player.name);
    if (event.target.checked){
        AddConstraint(player, constraint);
    } else {
        RemoveConstraint(player, constraint);
    }
}

function UpdateDrawPlayer() {
    let nodeList = document.querySelectorAll(".box");

    let name;
    let player;
    let elementsToRemove = [];
    nodeList.forEach(element => {
        //find corresponding player
        name = element.querySelector(".player-name").textContent;

        player = null;

        for (let i = 0; i < players.length; i++){
            if (players[i].name === name){
                player = players[i];
            }
        }

        if (player == null){
            //if can't find it was probably deleted
            elementsToRemove.push(element);
            return;
        }

        //update content
        console.log("Updating " + player.name + "'s node");
        UpdatePlayerDetails(player,element);
    });

    // Remove the collected elements outside the loop
    elementsToRemove.forEach(element => {
        element.remove();
    });
}

function UpdatePlayerDetails(player, uiParent){
    let name = uiParent.querySelector(".player-name");
    let receiver = uiParent.querySelector(".player-receiver");
    let constraints = uiParent.querySelector(".player-constraints");

    //remove previous constraints
    while (constraints.firstChild) {
        constraints.removeChild(constraints.lastChild);
    }
    //replace it with new
    constraints.appendChild(DrawConstraintsForm(player));

    //fill out content
    name.textContent = player.name;
    
    /*
    if (player.receiver == null){
        receiver.textContent = "Receiver not chosen";
    } else {
        receiver.textContent = "Giving present to " + player.receiver.name;
    }*/

    UpdateSortedText(player, uiParent)
}

function AddConstraint(player, constraint){
    //find if that constraint already exists
    for (let i = 0; i < player.constraints.length; i++){
        if (player.constraints[i].name === constraint.name){
            alert("This constraint already exists");
            return;
        }
    }
    //if passed, add constraint to player
    player.constraints.push(constraint);
    console.log(player.name + " has a new constraint: " + constraint.name);
}

function RemoveConstraint(player, constraint) {
    //find where the constraint is
    let index = FindName(player.constraints, constraint.name);
    if (index <= -1){
        alert("This constraint did not exist");
        return;
    }
    //remove the object from the constraint array
    console.log("Removing " + constraint.name + " from " + player.name + "'s constraints");
    player.constraints.splice(index, 1);
}

function RemovePlayer(player){
    let index = FindName(players, player.name);
    if (index <= -1){
        alert("This player could not be found");
        return;
    } 
    console.log("Removing " + player.name + " altogether");
    players.splice(index, 1);
    UpdateDrawPlayer();
}

function Sort() {
    console.log("Beginning to sort");
    //ensure nothing counts as collapsed
    chosen = [];
    
    for (let i = 0; i < players.length; i++){
        //collapse each player
        Collapse(players[i]);
    }
    //show us its done
    console.log("Sort complete");
    for (let i = 0; i < players.length; i++){
        if (players[i].receiver != null){
            console.log(players[i].name + " = " + players[i].receiver.name);
        } else {
            console.log(players[i].name + " has no receiver");
        }
    }

    UpdateDrawPlayer();
}

function Collapse(player) {
    console.log(" ");
    console.log("Collapsing " + player.name);
    
    player.receiver = ChooseReceiver(player);
    player.sorted = true;

    if (player.receiver != null){
        //this is now collapsed
        console.log(player.name + "'s receiver has been set to " + player.receiver.name);
        chosen.push(player.receiver);
    } else {
        console.log("We failed to set " + player.name + "'s receiver");
    }

    //print current collapsed
    console.log(" ");
    console.log("Current collapsed are (" + chosen.length + "):");
    for (let i = 0; i < chosen.length; i++){
        console.log(chosen[i].name);
    }
    console.log(" ");
}

function ChooseReceiver(player) {
    //get all players
    let entropy = [];
    console.log(" ");
    console.log("All possibilities include (" + players.length + "):");
    for (let i = 0; i < players.length; i++){
        entropy.push(players[i]);
        console.log(players[i].name);
    }
    let currentPlayer;
    let currentIndex;

    //print current constraints
    console.log(" ");
    console.log(player.name + "'s constraints are (" + player.constraints.length + "):");
    for (let i = 0; i < player.constraints.length; i++){
        console.log(player.constraints[i].name);
    }

    //print current collapsed
    console.log(" ");
    console.log("Current collapsed are (" + chosen.length + "):");
    for (let i = 0; i < chosen.length; i++){
        console.log(chosen[i].name);
    }
    console.log(" ");

    let removed;
    for (let i = 0; i < players.length; i++){
        currentPlayer = players[i].name;
        //remove all constrained players from list
        removed = false;
        for (let j = 0; j < player.constraints.length; j++){
            if (currentPlayer === player.constraints[j].name){
                //remove from entropy
                console.log("removing "+ currentPlayer + " from " + player.name + "'s entropy");
                currentIndex = FindName(entropy, currentPlayer);
                entropy.splice(currentIndex,1); //make it remove the right index
                removed = true;
            }
        }
        //remove all currently collapsed players from list
        if (!removed){
            for (let k = 0; k < chosen.length; k++){
                if (currentPlayer === chosen[k].name){
                    //remove from entropy
                    console.log("removing "+ currentPlayer + " from " + player.name + "'s entropy");
                    currentIndex = FindName(entropy, currentPlayer);
                    entropy.splice(currentIndex,1); //make it remove the right index
                }
            }
        }
    }
    //check if this list is empty
    if (entropy.length <= 0){
        console.log("No possible receiver for " + player.name);
        return null;
    }

    //show the options in the console for debugging
    console.log(player.name + "'s entropy consists of (" + entropy.length + "):")
    for (let i=0;i<entropy.length;i++){
        console.log(entropy[i].name);
    }
    console.log(" ");

    //choose something from the list
    let rand = Math.floor(Math.random() * entropy.length);
    return entropy[rand];
}

//returns the index of a Player Obj with a given name in an array
function FindName(arr, name){
    let found = false;
    let num;
    for (let i = 0; i < arr.length; i++){
        if (arr[i].name === name){
            found = true;
            num = i;
        }
    }
    if (found) {
        return num;
    } else {
        return -1;
    }
}

//exporting to excel
function exportToExcel() {

    // Sample data
    const data = [
        ['Gifter', 'Recipient'],
    ];

    try {
        if (XLSX == null){
            throw new Error('Unable to generate spreadsheet'); // You can throw a specific error message
        }

        //add each of the player data
        let currentReceiver;
        let row;
        for (let i = 0; i < players.length; i++){
            currentReceiver = players[i].receiver;

            if (currentReceiver != null){
                row = [players[i].name, players[i].receiver.name];
            } else {
                row = [players[i].name, "No receiver"];
            }

            data.push(row);
        }
    
        // Create a new workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
    
        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
        // Export the workbook as an XLSX file
        let dateString = GetDateString();
        XLSX.writeFile(wb, 'kris-kringle-${dateString}.xlsx');
    } catch (error) {
        alert('An error occurred: ' + error.message);
        return;
    }
}

function GetDateString() {
    let year = currentDate.getFullYear();
    let month = currentDate.getMonth();
    let day = currentDate.getDate();
    let hour = currentDate.getHours();
    let minute = currentDate.getMinutes();
    let second = currentDate.getSeconds();

    return day + "-" + month + "-" + year + "_" + hour + minute + second;
}