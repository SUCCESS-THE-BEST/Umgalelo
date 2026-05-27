CREATE DATABASE umgalelo;
USE umgalelo;
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(10),
    id_number VARCHAR(13) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    date_of_birth DATE,
	gender ENUM('male','female','other'),
	address_line1 VARCHAR(255),
	city VARCHAR(100),
	province VARCHAR(100),
	postal_code VARCHAR(20),
    occupation VARCHAR(100),
	next_of_kin_name VARCHAR(100),
	next_of_kin_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users 
ADD COLUMN is_verified BOOLEAN DEFAULT false,
ADD COLUMN verification_token VARCHAR(255);

ALTER TABLE users
ADD reset_token VARCHAR(255),
ADD reset_token_expires DATETIME;

ALTER TABLE users
ADD profile_photo VARCHAR(255),
ADD id_document VARCHAR(255),
ADD banking_proof VARCHAR(255);

SELECT * FROM users;

CREATE TABLE societies (
    society_id INT AUTO_INCREMENT PRIMARY KEY,
    society_name VARCHAR(100) NOT NULL,
    description TEXT,
    monthly_contribution DECIMAL(10,2) NOT NULL,
    cover_amount decimal(10, 2) NOT NULL,
    waiting_period int NOT NULL,
    additional_rules text NULL,
	province varchar(255) NOT NULL,
	city varchar(255) NOT NULL,
	maximum_members int NOT NULL,
    minimum_age int NULL,
    admin_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id)
        ON DELETE SET NULL
);

CREATE TABLE join_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    society_id INT,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (society_id) REFERENCES societies(society_id)
);

CREATE TABLE society_members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    society_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('member','admin','treasurer') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (society_id) REFERENCES societies(society_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    UNIQUE (society_id, user_id)
);

CREATE TABLE contributions (
    contribution_id INT AUTO_INCREMENT PRIMARY KEY,
    society_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending','paid','late') DEFAULT 'pending',
    FOREIGN KEY (society_id) REFERENCES societies(society_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

ALTER TABLE contributions 
ADD COLUMN payment_month VARCHAR(7) NOT NULL;

CREATE TABLE society_wallet (
    wallet_id INT AUTO_INCREMENT PRIMARY KEY,
    society_id INT NOT NULL UNIQUE,
    balance DECIMAL(12,2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (society_id) REFERENCES societies(society_id)
        ON DELETE CASCADE
);

CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    society_id INT NOT NULL,
    user_id INT,
    type ENUM('contribution','claim','refund') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (society_id) REFERENCES societies(society_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL
);

CREATE TABLE claims (
    claim_id INT AUTO_INCREMENT PRIMARY KEY,
    society_id INT NOT NULL,
    user_id INT NOT NULL,
    deceased_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50),
    claim_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','approved','rejected','paid') DEFAULT 'pending',
    claim_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (society_id) REFERENCES societies(society_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

ALTER TABLE claims 
ADD COLUMN date_of_death VARCHAR(15) NOT NULL;

CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    society_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
	FOREIGN KEY (society_id) REFERENCES societies(society_id)
        ON DELETE CASCADE
);

-- ALTER TABLE NOTIFICATIONS

ALTER TABLE notifications
ADD COLUMN read_at TIMESTAMP NULL,
ADD COLUMN expires_at TIMESTAMP NULL;

ALTER TABLE notifications
ADD COLUMN is_read VARCHAR(255) NULL;

ALTER TABLE notifications
modify COLUMN society_id INT NULL,
modify COLUMN expires_at TIMESTAMP NULL,
modify COLUMN read_at TIMESTAMP NULL;

ALTER TABLE notifications
ADD type VARCHAR(50) DEFAULT 'general';

-- EVENTS
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    society_id INT NOT NULL,
    type ENUM('funeral', 'meeting') NOT NULL,
    title VARCHAR(255),
    date DATE,
    time TIME,
    location VARCHAR(255),
    member VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM events;

-- MESSAGES
CREATE TABLE Messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    society_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_text text NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BIT,
	message_type VARCHAR(20),
	attachment_url VARCHAR(255),

    FOREIGN KEY (society_id) REFERENCES societies(society_id),
    FOREIGN KEY (sender_id) REFERENCES users(user_id)
);

select * from Messages;