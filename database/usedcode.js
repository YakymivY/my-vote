db.execute(`CREATE TABLE IF NOT EXISTS votings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL, 
    description TEXT,
    status ENUM('active', 'closed', 'completed') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`).then(result => {console.log(result)}).catch(error => {console.log(error)})

  db.execute(`CREATE TABLE IF NOT EXISTS candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voting_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    votes_num INT NOT NULL DEFAULT 0,
    FOREIGN KEY (voting_id) REFERENCES votings(id)
  );`).then(result => {console.log(result)}).catch(error => {console.log(error)})


  db.execute(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    login VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    voting_id INT NOT NULL,
    candidate_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (voting_id) REFERENCES votings(id),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
  );
  ALTER TABLE votings
ADD FOREIGN KEY (user_id) REFERENCES users(id);

  `).then(result => {console.log(result)}).catch(error => {console.log(error)})

 ` -- Insert dummy users
INSERT INTO users (name, login, password) VALUES
('User 1', 'user1', 'password1'),
('User 2', 'user2', 'password2'),
('User 3', 'user3', 'password3');

-- Insert dummy votings
INSERT INTO votings (user_id, title, description) VALUES
(1, 'Voting 1', 'Description for Voting 1'),
(2, 'Voting 2', 'Description for Voting 2'),
(3, 'Voting 3', 'Description for Voting 3');

-- Insert candidates for Voting 1
INSERT INTO candidates (voting_id, name) VALUES
(1, 'Candidate 1.1'),
(1, 'Candidate 1.2');

-- Insert candidates for Voting 2
INSERT INTO candidates (voting_id, name) VALUES
(2, 'Candidate 2.1'),
(2, 'Candidate 2.2'),
(2, 'Candidate 2.3');

-- Insert candidates for Voting 3
INSERT INTO candidates (voting_id, name) VALUES
(3, 'Candidate 3.1'),
(3, 'Candidate 3.2');


ALTER TABLE votings ADD COLUMN votes_num INT NOT NULL DEFAULT 0;`
