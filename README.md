# gambler

## Description

Poker cash game organizer that keeps a history of all the games a user has played.

## Models

- User:
  - username: String, required
  - password: String, required, encrypted
  - image/avatar: String
  - games played: Number
  - total played: Number
  - total won: Number
  - total lost: Number
  
- CashGame:
  - playerList [Player schema]
  - pot: Number
  - remainingPot: Number
  - isPlaying: Boolean
  - owner: String
  - secondaryOwners: [String]
  - pendingOwners: [String]
  - startDate: Date
  - endDate: Date
  
- Player:
  - name: String
  - buyin: Number
  - buyinHistory: [Number]
  - finalStack: Number
  - isPlaying: Boolean
  
## API endpoints

- GET "/auth/me"
  - 404 (Not Found) if user not logged in
  - Get current user

- POST "/auth/signup"
  - 401 (unauthorized) if user logged in
  - 200 (OK) if new user created successfully
  - Body:
    - username
    - password (encrypted)
  - Validation
    - fields empty (422)
    - user already exists (409)
  - Save new user and store session
  - Redirect to home page
  
- POST "/auth/login"
  - 401 (unauthorized) if user logged in
  - Body:
    - username
    - password
  - Validation
    - fields empty (422)
    - user not exists (404)
    - wrong password (404)
  - Store user in session
  - Redirect to home page
  
- POST "/auth/logout"
  - Delete user session
  - Redirect to title page

- GET "/cash-game/my-games"
  - Returns user's list of games
  
- GET "/cash-game/my-shared-games"
  - Gets the user's list of games that have been shared with him
  
- GET "/cash-game/:id"
  - Gets the cash game detail
  
- POST "/cash-game/create"
  - Creates new cash game
  
- DELETE "/cash-game/:id"
  - Deletes cash game
  
- PUT "/cash-game/delete-shared"
  - Deletes shared game from user's list of games
  
- PUT "/cash-game/:id/new-owner"
  - Accept shared game
  - Adds game to user's game's list
  
- PUT "/cash-game/:id/reject-share"
  - Reject shared game
  
- PUT "/cash-game/:id/new-player"
  - Add player to currently playing game
  
- PUT "/cash-game/:id/end-game"
  - End current playing game
  
- PUT "/cash-game/:id/player-stack/:playerId"
  - Assign final stack to player
  
- PUT "/cash-game/:id/player-rebuy/:playerId"
  - Add rebuy to player
  
- PUT "/cash-game/:id/share/:shareUserId"
  - Shares game with another user
    
## Link

https://gambler-app.firebaseapp.com/


