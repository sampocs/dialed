# Spec Prompt

Write a spec for a mobile application (described below). I'll provide some high level details as a shell but use it to flush out a full spec, being as specific as possible. It should use react native. The app will not have a database or API service - it will work entirely locally just using JSON local storage. It should be written in react native.

I will be deploying this on my phone manually so I'll want to export it as a .ipa file (or via TestFlight) which means I will likely need to eject the app from react native to XCode.

The goal of the app is to help keep score for a putting game. The app will be dead simple and just consist of a three tabs. The first tab will be the game titled "Play", the second tab will show past scores named "Rounds", and the third tab will show a chart, named "Metrics"

## First Time Launch

Prompt the user for their name when they first load the app, and then just always use that for each scorecard.

## Play Tab

There are three core states to be in: NO_GAME_IN_PROGRESS, GAME_READY, GAME_IN_PROGRESS, and GAME_COMPLETE.

### NO_GAME_IN_PROGRESS

This is the home page. It should just have a single button that says "New Game". If that button is clicked, it generates a course and moves to the next phase.

### Game Ready

A course should be generated. There should be 18 holes, with 4 par 1s, 4 par 2s, and 10 par 3s. The front and back 9 should have 2 par 1s , 2 par 2s, and 5 par 3s respectively. When the course is generated, an empty scorecard should be displayed. Meaning it shows a table with the hole numbers, whether it's a par [1,2, or 3], the hole distance, and the cumulative par for the front, back and total (21, 21, and 42) and cumulative distance.

The placement of the par 1s and 3s should be randomly generated (similar to a normal golf course). There should only be one player on the scorecard, and they should have the name that the user entered on the first time launch.

The distance should also be generated for each hole according to the following rules.
Par can be either 1, 2, or 3
For Par 1s: Distance can be either 2.5, 3, 3.5, or 4ft
For Par 2s: Distance can be either 4.5, 5, 5.5, 6, 6.5, 7, or 7.5 ft
For Par 3s: Distance is always 10ft

The distance for each hold should be randomly generated (within the given range), meaning that each course will be a different length.

Finally, there should be a small button under the scorecard that allows generating a new course. And then a bigger button that says "Start Round"

### GAME_IN_PROGRESS

Once Start Round is clicked, the game is in progress and should show the following:

The top right of the page should have an "X" that if you click it says "Quit the game?" with a yes/no prompt. If you click "Yes" it goes back to the "NO_GAME_IN_PROGRESS" phase.

The top of the page will show the hole number out of 18 (e.g. "2/18"). With an arrow on either side that moves it to the next or previous hole.

Underneath will show the current score of the game which will consist of the number of strokes and then a (+/-) relative to par. For instance, if the first 3 holes are all par 2s and you shoot a 2 and then a 1, on hole 3 it would show: "3 (-1)".

They should be able to click their score and the scorecard pops up on top of the page with a blurred background so they can see the round progress so far.

Finally below that, will be buttons to enter the score. They should be horizontally aligned. For par 1s and 2s, there should be three buttons (1, 2 and 3). For par 3s there should be 4 buttons (1,2,3, and 4). When a button is clicked it should turn solid (to show it's selected) and then adjust the score and differential accordingly.

On the 1st hole there should be no back button. On the last hole (hole 18) there should be no forward button. On hole 18, after the score is selected, a button should appear at the bottom that says "Submit". If clicked, it moves the the next phase "GAME_COMPLETE"

### GAME_COMPLETE

The game complete page will show the score card again, but this time filled out with the scores from each hole. The scorecard info should get stored in the round history. This time if the X is clicked in the top right, it will just exit to the "NO_GAME_IN_PROGRESS" page immediately (instead of asking if they want to quit).

## Rounds Tab

At the top of this page it will show "{PlayerName}'s Rounds" and if you hold down on that, a pop up will appear to change the name.

Below that, this should show a running list of past scores, sorted by time. This should be an infinite scroll (instead of having pages). Each previous round component should show the distance, cumulative score, and differential. There should be a star next to the best round. Additionally each round component should have a drop down arrow such that, if clicked, it shows the scorecard below (and can be collapsed again). The scorecards should all be collapsed at initial page load.

Each component should also have a three dot button that if clicked allows you to either "Delete" or "Edit" the round. If Edit is clicked, the same type of page that appears when in the "Play" tab in "Game in Progress" phase should appear. But this time instead of an X at the top right, it should be a button that says "Save" and there should be no button "Submit" button on hole 18. The score for each hole should also be adjustable here

## Metrics Tab

This should show a chart of the scores from the past rounds. Y axis is score, x axis is round number.

## Misc Points

It should not be possible to delete all data/rounds at once.

There should be one color theme regardless of whether the user uses light or dark them.

There should be no sound effects or accessibliity features.
