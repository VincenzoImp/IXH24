// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract YourContract {
    // Mapping to track the number of professors in a university
    mapping(address => uint256) public universityProfessors;

    mapping(address=> bool) public isUniversity;

    // Mapping to track the votes of universities (key is university address, value is their vote as a string)
    mapping(address => string) public universityVotes;


    // Mapping to associate a professor's address with their university
    mapping(address => address) public professorToUniversity;

    // Maximum number of professors allowed per university
    uint256 public constant CAP = 30;

    // Enum to represent the status of the presidential election
    enum VoteStatus { NO_ELECTION, IN_PROGRESS, CLOSED }

    // Variable to track the current election status
    VoteStatus public VOTE_STATUS;

    // Global variable to track the total number of universities
    uint256 public universityCount;

    // Global variable to track the election duration in blocks (not days)
    uint256 public electionDurationInBlocks;

    // Global variable to track the election end block number
    uint256 public electionEndBlock;

    // Fixed fee in wei for enrolling or unrolling (now 10 wei)
    uint256 public constant ENROLLMENT_FEE = 10; // 10 wei

    // Election start fee: 100 wei to start the election
    uint256 public constant ELECTION_START_FEE = 100; // 100 wei to start the election

    // Address of the university that started the election
    address public universityAddress;

    // Mapping to track which universities have voted
    mapping(address => bool) public universitiesVoted;

    // List of all university addresses
    address[] public universities;

    // Event to log when a university votes
    event UniversityVoted(address indexed university);

    // Events to log enrollments, removals, and election status changes
    event ProfessorEnrolled(address indexed professor, address indexed university, uint256 totalProfessors, uint256 feePaid);
    event ProfessorRemoved(address indexed professor, address indexed university, uint256 totalProfessors, uint256 feeRefunded);
    event VoteStatusChanged(VoteStatus newStatus);
    event ElectionStarted(address indexed university, uint256 electionEndBlock);
    event FeeReceived(address indexed professor, address indexed university, uint256 fee);

    // Add a state variable to track the number of universities that voted
    uint256 public votedUniversitiesCount;

    // Constructor to set default values for universityCount, electionDuration, and election status
    constructor() {
        // Hardcoded university addresses
        universities.push(0x7fE6d8A75cc46A3f28DbdafC180eA86330d3bA67);
        universities.push(0x6044f21C9A63c70b0E694c3403A8247C2571De2a);
        universities.push(0x9a7b2A38FeC15Bc72b8f75027EE4d6089765c0ff);
        isUniversity[0x7fE6d8A75cc46A3f28DbdafC180eA86330d3bA67] = true;
        isUniversity[0x6044f21C9A63c70b0E694c3403A8247C2571De2a] = true;
        isUniversity[0x9a7b2A38FeC15Bc72b8f75027EE4d6089765c0ff] = true;


        universityCount = universities.length;  // Total number of hardcoded universities
        electionDurationInBlocks = 10000;  // Default election duration in blocks
        VOTE_STATUS = VoteStatus.NO_ELECTION;  // Initial election status is "no election"
        votedUniversitiesCount = 0;  // Initially, no universities have voted
    }

    // Modifier to ensure actions are only allowed when there is no election
    modifier onlyWhenNoElection() {
        require(VOTE_STATUS == VoteStatus.NO_ELECTION, "Action not allowed during election.");
        _;
    }

    // Modifier to ensure actions are only allowed during an ongoing election
    modifier onlyDuringElection() {
        require(VOTE_STATUS == VoteStatus.IN_PROGRESS, "Election is not in progress.");
        _;
    }


    // Modifier to allow actions only for hardcoded universities
    modifier onlyUniversities(address addr) {
        bool isAllowed = isUniversity[addr];
        require(isAllowed, "Sender is not a recognized university.");
        _;
    }

    // Function to enroll the professor (sender) in a university and pay the enrollment fee
    function enrollProfessor(address university) external payable onlyWhenNoElection onlyUniversities(university) {
        address professor = msg.sender; // Use the msg.sender as the professor address
        require(professorToUniversity[professor] == address(0), "Professor is already enrolled in a university.");
        require(universityProfessors[university] < CAP, "University has reached the maximum capacity of professors.");
        require(msg.value == ENROLLMENT_FEE, "Incorrect enrollment fee.");

        // Log the received fee
        emit FeeReceived(professor, university, msg.value); // Log the fee sent with the transaction

        // Assign the professor to the university
        professorToUniversity[professor] = university;

        // Increment the count of professors in the university
        universityProfessors[university] += 1;

        // Transfer the fee to the university
        payable(university).transfer(msg.value);

        // Emit an event for the enrollment
        emit ProfessorEnrolled(professor, university, universityProfessors[university], msg.value);
    }

    // Function to start the election (called by the university)
    function startVotation() external payable onlyWhenNoElection onlyUniversities(msg.sender) {
        require(msg.value == ELECTION_START_FEE, "Incorrect election start fee.");
        
        // Change the election status to IN_PROGRESS
        VOTE_STATUS = VoteStatus.IN_PROGRESS;

        // Set the election end block based on the current block number and election duration in blocks
        electionEndBlock = block.number + electionDurationInBlocks;

        // Emit event for election start
        emit ElectionStarted(msg.sender, electionEndBlock);
        
        // Emit an event for the status change
        emit VoteStatusChanged(VOTE_STATUS);

        // Set the university that started the election
        universityAddress = msg.sender;
    }

    // Modified vote function to accept a string input
    function vote(string memory voteData) external onlyDuringElection onlyUniversities(msg.sender) {
        address university = msg.sender;
        
        require(!universitiesVoted[university], "University has already voted.");
        require(bytes(voteData).length > 0, "Vote data cannot be empty."); // Ensure the vote string is not empty

        // Mark the university as having voted
        universitiesVoted[university] = true;

        // Save the vote data
        universityVotes[university] = voteData;

        // Increment the count of universities that have voted
        votedUniversitiesCount++;

        // Emit event when university votes
        emit UniversityVoted(university);

        // Check if the election should end
        checkElectionStatus();
    }

   function removeProfessor(address professor) external onlyWhenNoElection {
        address university = professorToUniversity[professor]; // Get the university associated with the professor
        require(university != address(0), "Professor is not enrolled in any university.");
        require(msg.sender == university, "Only the associated university can remove this professor.");

        // Decrease the count of professors in the university
        universityProfessors[university] -= 1;

        // Remove the professor's association with the university
        professorToUniversity[professor] = address(0);

        // Emit an event for the removal
        emit ProfessorRemoved(professor, university, universityProfessors[university], ENROLLMENT_FEE);
    }




    // Function to check if the election is over by either reaching the CAP or deadline
    function checkElectionStatus() public {
        // Use the new votedUniversitiesCount variable
        if (votedUniversitiesCount >= universityCount || block.number >= electionEndBlock) {
            VOTE_STATUS = VoteStatus.CLOSED;

            // If quorum is not reached, refund the fee to the university that started the election
            if (votedUniversitiesCount < universityCount / 2) {  // Quorum is set to half of the universities
                payable(universityAddress).transfer(ELECTION_START_FEE); // Refund the fee
            }

            emit VoteStatusChanged(VOTE_STATUS); // Emit event when election is closed
        }
    }
}
