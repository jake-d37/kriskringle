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

//ensure text isn't empty
function ValidTextCheck(string){
    if (string.trim() == ""){
        return false;
    }

    return true;
}

//creates a card for a new player and creates a new Player object
function AddPlayer() {
    let name = document.querySelector("#new-player").value;
    
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

//draws new card
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
    card.querySelector('.card-inner').classList.toggle('flipped');
}


//update text outlining state of sorting on the card
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

//draw the constraints section of a card
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
    if (event.target.checked){
        AddConstraint(player, constraint);
    } else {
        RemoveConstraint(player, constraint);
    }
}

//update the card to match changed data
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
        UpdatePlayerDetails(player,element);
    });

    // Remove the collected elements outside the loop
    elementsToRemove.forEach(element => {
        element.remove();
    });
}

//update player section of card when data changes
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
    
    UpdateSortedText(player, uiParent)
}

//add new constraint to a Player object
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
}

//remove constraint from a Player object
function RemoveConstraint(player, constraint) {
    //find where the constraint is
    let index = FindName(player.constraints, constraint.name);
    if (index <= -1){
        alert("This constraint did not exist");
        return;
    }
    //remove the object from the constraint array
    player.constraints.splice(index, 1);
}

//remove a player from the game entirely
function RemovePlayer(player){
    let index = FindName(players, player.name);
    if (index <= -1){
        alert("This player could not be found");
        return;
    } 
    players.splice(index, 1);
    UpdateDrawPlayer();
}

//sort which player is assigned to which recipient
function Sort() {
    //ensure nothing counts as collapsed
    chosen = [];
    
    for (let i = 0; i < players.length; i++){
        //collapse each player
        Collapse(players[i]);
    }
    //show us its done
    let warnUser = false;
    for (let i = 0; i < players.length; i++){
        if (players[i].receiver == null){
            warnUser = true;
        }
    }

    if (warnUser){
        document.querySelector(".warning").style.display = "block";
    } else {
        document.querySelector(".warning").style.display = "none";
    }

    UpdateDrawPlayer();
}

//choose a recipient for a given player object
function Collapse(player) {    
    player.receiver = ChooseReceiver(player);
    player.sorted = true;

    if (player.receiver != null){
        //this is now collapsed
        chosen.push(player.receiver);
    } 
}

//find entropy and choose a player object at random from entropy
function ChooseReceiver(player) {
    //get all players
    let entropy = [];

    for (let i = 0; i < players.length; i++){
        entropy.push(players[i]);
    }

    let currentPlayer;
    let currentIndex;
    let removed;
    for (let i = 0; i < players.length; i++){
        currentPlayer = players[i].name;
        //remove all constrained players from list
        removed = false;
        for (let j = 0; j < player.constraints.length; j++){
            if (currentPlayer === player.constraints[j].name){
                //remove from entropy
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
                    currentIndex = FindName(entropy, currentPlayer);
                    entropy.splice(currentIndex,1); //make it remove the right index
                }
            }
        }
    }
    //check if this list is empty
    if (entropy.length <= 0){
        return null;
    }

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
        ['',''],
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
        XLSX.writeFile(wb, "kris-kringle-" + dateString + ".xlsx");
    } catch (error) {
        alert('An error occurred: ' + error.message);
        return;
    }
}

//return a string for a code of the current time and date
function GetDateString() {
    let currentDate = new Date();

    let year = currentDate.getFullYear();
    let month = currentDate.getMonth();
    let day = currentDate.getDate();
    let hour = currentDate.getHours();
    let minute = currentDate.getMinutes();
    let second = currentDate.getSeconds();

    return day + "-" + month + "-" + year + "_" + hour + minute + second;
}
