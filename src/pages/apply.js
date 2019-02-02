import * as React from "react";
import Helmet from 'react-helmet';
import { Redirect } from "react-router-dom";
import Link from 'gatsby-link';
import Checkbox from '../components/Checkbox';
import Input from '../components/Input';
import Moment from 'moment';
import { paymentMethodMessage } from '../constants/variables';
import { changeTargetChild, changeTarget, getRef, getValue } from "../firebase/db";
import { db } from "../firebase";

const gotchaStyle = {
    display: 'none'
}

class Application extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            yearsArray: '',
            chosenYear: '',
            numberOfChildren: 1,
            totalCost: 0,
            amountDue: 0,
            campTimezoneOffset: 4,
            localTimezoneOffset: '',
            campTimes: '',
            rawCampTimes: '',
            Week1: 0,
            Week2: 0,
            Week3: 0,
            Week4: 0,
            Week5: 0,
            Week6: 0,
            Week7: 0,
            Week8: 0,
            Week9: 0,
            WeekA: 0,
            WeekB: 0,
            totalWeeksSelected: 0,
            weekArray: [],
            childFirstName: '',
            childLastName: '',
            age: 0,
            birthday: '',
            allergies: '',
            parent1Name: '',
            parent1Phone: '',
            parent1Email: '',
            parent1EmailVerify: '',
            parent2Name: '',
            parent2Phone: '',
            parent2Email: '',
            emergency1Name: '',
            emergency1Relationship: '',
            emergency1Phone: '',
            emergency2Name: '',
            emergency2Relationship: '',
            emergency2Phone: '',
            physicianName: '',
            physicianPhone: '',
            dentistName: '',
            dentistPhone: '',
            address: '',
            option: '',
            firstWeek: 0,
            page: 0,
            buttonHash: '',
            submitted: false,
            message: '',
            redirectString: '',
            paymentMethod: ''
        }
    }

    componentDidMount() {
        let {
            chosenYear,
            rawCampTimes,
            localTimezoneOffset
        } = this.props.location.state;
        let weekArray = this.getWeekArray(chosenYear);
        let location;
        if(window !== undefined) {
            location = window.location;
        } else {
            location = process.env.NODE_ENV === 'production'? "https://www.summerinthewoodscamp.com/apply":"https://localhost:8000/apply";
        }
        this.setState({
            chosenYear,
            rawCampTimes,
            localTimezoneOffset,
            weekArray,
            location
        });
    }
    getHash = () => {
        let hash;
        if (this.state.totalWeeksSelected < 4 && this.state.totalWeeksSelected > 0) {
            hash = 1;
        } else if (this.state.totalWeeksSelected > 3 && this.state.totalWeeksSelected < 14) {
            hash = 2;
        } else {
            hash = 0;
        }
        return hash;
    }
    makeRedirectString = (paymentMethod, window) => {
        let redirectString = '';
        if (this.props.location.pathname !== undefined) {
            redirectString = this.state.location.href.slice(0, (this.state.location.href.indexOf('/apply') + 1));
            console.log('pathname base', redirectString, this.props.location, window)
        } else {
            redirectString = 'www.summerinthewoodscamp.com/'
        }
        let name = this.state.parent1Name.replace(/\s+/g, '_');
        let email = this.state.parent1Email.replace(/\s+/g, '_');
        let childFirstName = this.state.childFirstName.replace(/\s+/g, '_');
        let childLastName = this.state.childLastName.replace(/\s+/g, '_');
        if (paymentMethod === "paypal") {
            let hash = this.getHash();
            let hash2 = parseInt(hash) + 2;
            redirectString += "paypal/?t=" + (hash === 1 ? 3 : hash === 2 ? 4 : 0) + "+a=" + hash + "+";
        } else {
            redirectString += "mail/?";
        }
        redirectString += "c=" + this.state.totalCost + "+d=" + this.state.amountDue + "+w=" + this.state.totalWeeksSelected + "+n=" + name + "+e=" + email + "+f=" + childFirstName + "+l=" + childLastName + "+p=" + this.state.parent1phone;
        console.log(redirectString);
        this.setState({ redirectString });
        return redirectString;
    }


    getWeekArray = (yearString) => {
        let yearChosen = this.props.location.state.rawCampTimes[this.props.location.state.chosenYear]
        let weekArray = [];
        let year = yearString;
        for (let weekChosen in yearChosen) {
            let week = weekChosen;
            let { start, end, available, pending, noCamp } = yearChosen[week]
            start = new Date(start);
            start = (parseInt(start.getMonth()) + 1) + "/" + start.getDate();
            end = new Date(end);
            end = (parseInt(end.getMonth()) + 1) + "/" + end.getDate();
            weekArray.push({ week, year, start, end, available, pending, noCamp })
        }
        return weekArray
    }

    handleChange = e => {
        let { name, value } = e.target;
        this.setState({ [name]: value });
    }

    handleEmail = e => {
        let { name, value } = e.target;
        this.setState({ [name]: value })
    }

    handlePaymentMethod = paymentMethod => {
        let redirectString;
        if (paymentMethod === "paypal") {
            redirectString = this.makeRedirectString("paypal");
        } else {
            redirectString = this.makeRedirectString("mail");
        }
        console.log(redirectString);
        this.setState({
            redirectString: redirectString,
            paymentMethod: paymentMethod
        })
    }

    handleTelephoneNumber = e => {
        let { name, value } = e.target;
        let temp = ''
        let string = value.replace(/[^0-9]+/g, '').toString();
        let firstPart = string.slice(0, 3)
        let secondPart = string.slice(3, 6)
        let thirdPart = string.slice(6, length)
        let length = string.length
        if (length > 0 && length < 4) {
            temp = "(" + string
        } else if (length > 3 && string.length < 7) {
            temp = "(" + firstPart + ")" + secondPart;
        } else if (length > 6) {
            temp = "(" + firstPart + ")" + secondPart + "-" + thirdPart;
            temp = temp.slice(0, 13)
        }
        this.setState({ [name]: temp });
    }

    handleYearSelect = year => {
        this.setState({ chosenYear: year, weekArray: this.getWeekArray(this.state.rawCampTimes[year], year), Week0: 0, Week1: 0, Week2: 0, Week3: 0, Week4: 0, Week5: 0, Week6: 0, Week7: 0, Week8: 0, Week9: 0, WeekA: 0, WeekB: 0, firstWeek: 0, totalCost: 0, amountDue: 0 })
    }

    handleSubmit = event => {
        event.preventDefault();
        console.log(this.props.location.pathname, this.state);
        if (this.state.physicianPhone && this.state.physicianName && this.state.dentistPhone && this.state.dentistName && this.props.location.pathname !== undefined) {
            let {
                childFirstName,
                childLastName,
                age,
                birthday,
                allergies,
                parent1Name,
                parent1Phone,
                parent1Email,
                parent2Name,
                parent2Phone,
                parent2Email,
                emergency1Name,
                emergency1Relationship,
                emergency1Phone,
                emergency2Name,
                emergency2Relationship,
                emergency2Phone,
                physicianName,
                physicianPhone,
                dentistName,
                dentistPhone,
                address,
                localTimezoneOffset,
                chosenYear,
                Week1,
                Week2,
                Week3,
                Week4,
                Week5,
                Week6,
                Week7,
                Week8,
                Week9,
                WeekA,
                WeekB,
                paymentMethod
            } = this.state;

            age = this.getAge(this.state.birthday);
            const key = chosenYear + "_" + childFirstName + "_" + childLastName + "_" + age;
            const application = {
                childFirstName,
                childLastName,
                age,
                birthday,
                allergies,
                parent1Name,
                parent1Phone,
                parent1Email,
                parent2Name,
                parent2Phone,
                parent2Email,
                emergency1Name,
                emergency1Relationship,
                emergency1Phone,
                emergency2Name,
                emergency2Relationship,
                emergency2Phone,
                physicianName,
                physicianPhone,
                dentistName,
                dentistPhone,
                address,
                localTimezoneOffset,
                chosenYear,
                Week1,
                Week2,
                Week3,
                Week4,
                Week5,
                Week6,
                Week7,
                Week8,
                Week9,
                WeekA,
                WeekB,
                paymentMethod,
                key
            }
            let weeksAttending = [];
            getValue('test').then(test => {
                console.log(test);
                for (let item in application) {
                    console.log('item', item, application[item]);
                    if (item.slice(0, 4) === "Week" && application[item] !== 0) {
                        weeksAttending.push(item);
                    }
                }
                return weeksAttending;
            }).then(weeks => {
                console.log(weeks);
                changeTargetChild('applications', key, application)
                    .then(() => {
                        weeks.forEach(week => {
                            let pendingPath = `campTimes/year/${chosenYear}/${week}/pending`;
                            console.log('pendingPath', pendingPath);
                            let pendingRef = getRef(pendingPath);
                            getValue(pendingRef).then(pending => {
                                changeTarget(`campTimes/${key.slice(0, 4)}/${week}/pending`, parseInt(pending) + 1);
                                this.setState({ submitted: true, page: 5 }, () => console.log('page 5'));
                            })
                        })
                    })
            }
            )
        } else {
            this.setState({ error4: "Please fill out all required fields." })
        }
    }

    handleNext = event => {
        event.preventDefault();
        window.scrollTo(0, 0);
        switch (event.target.id) {
            case 'previousPage0':
                this.setState({ page: 0 });
                break;
            case 'submitPage0':
                this.state.amountDue > 0 ?
                    this.setState({ page: 1, error0: "" }) :
                    this.setState({ error0: "Please select at least one week." });
                break;
            case 'previousPage1':
                this.setState({ page: 1 });
                break;
            case 'submitPage1':
                (this.state.childFirstName && this.state.childLastName && this.state.birthday) ?
                    this.setState({ page: 2, error1: "" }) :
                    this.setState({ error1: "Please fill out all required fields." });
                break;
            case 'previousPage2':
                this.setState({ page: 2 });
                break;
            case 'submitPage2':
                (this.state.parent1Phone && this.state.parent1Name && this.state.address && this.state.parent1Email == this.state.parent1EmailVerify) ?
                    this.setState({ page: 3, error2: '' }) :
                    this.setState({ error2: "Please fill out all required fields and make sure the email fields are filled in properly." });
                break;
            case 'previousPage3':
                this.setState({ page: 3 });
                break;
            case 'submitPage3':
                (this.state.emergency1Name && this.state.emergency2Name && this.state.emergency1Phone && this.state.emergency2Phone && this.state.emergency1Relationship && this.state.emergency2Relationship) ?
                    this.setState({ page: 4, error3: '' }) :
                    this.setState({ error3: "Please fill out all required fields." });
                break;
            case 'submitPage4':
                (this.state.physicianPhone && this.state.physicianName && this.state.dentistPhone && this.state.dentistName) ?
                    this.setState({ page: 5, error4: '' })
                    :
                    this.setState({ error4: "Please fill out all required fields." })
                break;
            case 'previousPage4':
                this.setState({ page: 4 });
                break;
        }
    }

    handleWeekSelect = (week, value) => {
        if (this.state[week] == value) {
            this.setState({ [week]: 0 }, () => this.getCost())
        }
        else if(this.state[week] === 1) {
            this.setState({ [week]: 0 }, () => this.getCost());
        } else {
            if(this.state[week] === 0) {
                this.setState( { [week]: 1 }, () => this.getCost());
            }
        }
    }

    makeWeekArray = () => {
        let weekArray = [this.state.Week1, this.state.Week2, this.state.Week3, this.state.Week4, this.state.Week5, this.state.Week6, this.state.Week7, this.state.Week8, this.state.Week9, this.state.WeekA, this.state.WeekB];
        return weekArray
    }

    getAge = (birthdate) => {
        if (parseInt(birthdate.slice(0, 4)) > 1000 && parseInt(birthdate.slice(0, 4)) < Moment().year()) {
            let age = Moment().diff(birthdate, 'years') || 0;
            return age;
        } else {
            return 0;
        }
    }

    getCost = () => {
        let weekArray = this.makeWeekArray()
        let totalWeeksSelected = weekArray.filter(value => value === 1).length;
        console.log('getcost being called', totalWeeksSelected)
        let totalCost = 0;
        let initialCost = 0;
        if (totalWeeksSelected > 3) {
            totalCost = 155 * totalWeeksSelected;
            initialCost = 155;
        } else if (totalWeeksSelected) {
            totalCost = 180 * totalWeeksSelected;
            initialCost = 180;
        } else {
            totalCost = 0;
            initialCost = 0;
        }
        let test = weekArray.filter(value => value === 0);
        let amountDue = 0;
        if (test.length === weekArray.length) {
            amountDue = 0;
        }
        else {
            amountDue = initialCost + (totalWeeksSelected - 1) * 25;
        }
        console.log("totalCost", totalCost, "amountDue", amountDue);
        this.setState({ totalCost, amountDue, initialCost, totalWeeksSelected });
    }

    render() {
        return (
            !this.props.location.state ?
                <Redirect to="/" />
                :
                (
                    <div>
                        <Helmet>
                            <title>Summer In The Woods</title>
                            <meta name="daescription" content="Application Page" />
                        </Helmet>
                        <div id="main">
                            <div className="inner">
                                <section>
                                    <form action={process.env.GATSBY_EMAIL_APPLICATION_TO} method="POST" acceptCharset="utf-8">
                                        <input
                                            type="hidden"
                                            name="_utf8"
                                            value="✓"
                                        />
                                        <input
                                            type="hidden"
                                            value={this.state.redirectString}
                                            name="_redirect"
                                        />
                                        <h1>Application</h1>
                                        <div>
                                            <div className={`${this.state.page === 5 ? 'hide' : ''} ${this.state.page === 0 || this.state.page === 5 ? '' : 'displayNone'}`}>
                                                <div>
                                                    <p className='errorMessage'>{this.state.error0}</p>
                                                    <p>Year {this.props.location.state.yearsArray[0]}</p>
                                                    <div className="yearBox infoBox">
                                                        <h2>Select the weeks you would your child to attend.</h2>
                                                        {this.props.location.state.yearsArray.length > 1 ?
                                                            <div>
                                                                <Checkbox
                                                                    name="year1"
                                                                    value={this.props.location.state.yearsArray[0]}
                                                                    onChange={this.handleYearSelect}
                                                                    checked={this.state.chosenYear == this.props.location.state.yearsArray[0]}
                                                                    className='float-left'
                                                                    value={this.props.location.state.yearsArray[0]}
                                                                    onClick={() => this.handleYearSelect(this.props.location.state.yearsArray[0])}
                                                                    text={this.props.location.state.yearsArray[0]}
                                                                />
                                                                <Checkbox
                                                                    type="checkbox"
                                                                    name="year2"
                                                                    value={this.props.location.state.yearsArray[1]}
                                                                    onChange={this.handleYearSelect}
                                                                    checked={this.state.chosenYear == this.props.location.state.yearsArray[1]}
                                                                    className='float-left' value={this.props.location.state.yearsArray[0]}
                                                                    onClick={() => this.handleYearSelect(this.props.location.state.yearsArray[1])}
                                                                    text={this.props.location.state.yearsArray[1]}
                                                                />
                                                            </div>
                                                            :
                                                            <div>
                                                                <Checkbox
                                                                    name="year1"
                                                                    value={this.props.location.state.yearsArray[0]}
                                                                    onChange={this.handleYearSelect} checked={true}
                                                                    className='float-left'
                                                                    value={this.props.location.state.yearsArray[0]}
                                                                    onClick={() => this.handleYearSelect(this.props.location.state.yearsArray[0])}
                                                                    text={this.props.location.state.yearsArray[0]}
                                                                />
                                                            </div>
                                                        }
                                                    </div>
                                                    <div className="infoBox">
                                                        {this.state.weekArray.map((week, i) =>
                                                            week.noCamp ?
                                                                <div key={week.week} className='smallBox'>
                                                                    <p style={{ fontSize: "1.5em" }}>{week.start}-{week.end}<br /> No Camp This Week</p>
                                                                </div> :
                                                                <div key={week.week} className='smallBox'>
                                                                    <p style={week.available - week.pending > 0 ? { fontSize: "1.5em" } : { fontSize: "1.5em", textDecoration: "line-through" }}>{week.start}-{week.end} <br />{(week.available - week.pending) ? "Limited spaces available" : "No spaces availble"}</p>
                                                                    {(week.available - week.pending) > 0 ?
                                                                        <div key={i}>
                                                                            <Checkbox
                                                                                name={week.week}
                                                                                value={true}
                                                                                onChange={() => this.handleWeekSelect(week.week, true)}
                                                                                checked={this.state[week.week] == true}
                                                                                onClick={() => this.handleWeekSelect(week.week, true)}
                                                                                text={`Sign up for the week of ${week.start}`}
                                                                            />
                                                                        </div>
                                                                        :
                                                                        <div key={i}>
                                                                            <Checkbox
                                                                                labelStyle={{ textDecoration: 'line-through' }}
                                                                                disabled={true}
                                                                                name={`${week.week}`}
                                                                                value={true} onChange={() => this.handleWeekSelect(week.week, true)}
                                                                                checked={false} value={true}
                                                                                onClick={() => this.handleWeekSelect(week.week, true)}
                                                                                text="No Camp"
                                                                            />
                                                                        </div>
                                                                    }
                                                                </div>
                                                        )}
                                                    </div>
                                                    <h2>Total Amount Due To Reserve Selected Weeks: ${this.state.amountDue}</h2>
                                                    <h2>Total Cost ${this.state.totalCost}</h2>
                                                    <button
                                                        className="button nextPage firstButton"
                                                        id="submitPage0"
                                                        onClick={this.handleNext}
                                                    >
                                                        Next
                                                </button>
                                                </div>
                                            </div>
                                            <div className={`${this.state.page === 5 ? 'hide' : ''} ${this.state.page === 1 || this.state.page === 5 ? '' : 'displayNone'}`}>
                                                <h2>Total Amount Due To Reserve Selected Weeks: ${this.state.amountDue}</h2>
                                                <h2>Child's Information</h2>
                                                <p className='errorMessage'>{this.state.error1}</p>
                                                <div className="infoBox">
                                                    <Input
                                                        className="field half first"
                                                        text="Child's First Name"
                                                        type="text"
                                                        name="childFirstName"
                                                        placeholder="Required"
                                                        onChange={this.handleChange}
                                                        value={this.state.childFirstName}
                                                        required
                                                    />
                                                    <Input
                                                        className="field half"
                                                        text="Child's Last Name"
                                                        type="text"
                                                        name="childLastName"
                                                        placeholder="Required"
                                                        onChange={this.handleChange}
                                                        value={this.state.childLastName}
                                                        required
                                                    />
                                                    <Input
                                                        className="field half"
                                                        text="Birthdate"
                                                        type="date"
                                                        name="birthday"
                                                        placeholder="Required"
                                                        onChange={this.handleChange}
                                                        value={this.state.birthday}
                                                        required
                                                    />
                                                    <Input
                                                        className="field half first"
                                                        text="Age"
                                                        type="number"
                                                        name="age"
                                                        onChange={this.handleChange}
                                                        value={this.getAge(this.state.birthday)}
                                                        readOnly={true}
                                                    />
                                                    <div className="field">
                                                        <label htmlFor="allergies">Allergies</label>
                                                        <textarea
                                                            name="allergies"
                                                            rows="6"
                                                            placeholder="Optional"
                                                            onChange={this.handleChange}
                                                            value={this.state.allergies}
                                                        >
                                                        </textarea>
                                                    </div>
                                                </div>
                                                <button
                                                    className="button"
                                                    id="previousPage0"
                                                    onClick={this.handleNext}
                                                >
                                                    Previous
                                            </button>
                                                <button
                                                    className="button nextPage"
                                                    id="submitPage1"
                                                    onClick={this.handleNext}
                                                >
                                                    Next
                                            </button>
                                            </div>
                                            <div className={`${this.state.page === 5 ? 'hide' : ''} ${this.state.page === 2 || this.state.page === 5 ? '' : 'displayNone'}`}>
                                                <h2>Total Amount Due To Reserve Selected Weeks: ${this.state.amountDue}</h2>
                                                <p className='errorMessage'>{this.state.error2}</p>
                                                <h2>Parent Information</h2>
                                                <div className="infoBox">
                                                    <div className='smallBox'>
                                                        <p className="formText">Parent 1</p>
                                                        <Input
                                                            className="field half first"
                                                            text="Parent or Guardian's Name"
                                                            type="text"
                                                            name="parent1Name"
                                                            placeholder="Required"
                                                            onChange={this.handleChange}
                                                            value={this.state.parent1Name}
                                                            required
                                                        />
                                                        <Input
                                                            className="field half"
                                                            text="Parent or Guardian's Phone Number"
                                                            type="tel"
                                                            name="parent1Phone"
                                                            placeholder="Required"
                                                            required
                                                            onChange={this.handleTelephoneNumber}
                                                            value={this.state.parent1Phone}
                                                        />
                                                        <Input
                                                            className="field half"
                                                            text="Parent or Guardian's Email"
                                                            type="email"
                                                            name="parent1Email"
                                                            placeholder="Required"
                                                            required
                                                            onChange={this.handleEmail}
                                                            value={this.state.parent1Email}
                                                        />
                                                        <Input
                                                            className="field half"
                                                            text="Please Re-enter Email"
                                                            type="email"
                                                            name="parent1EmailVerify"
                                                            placeholder="Required"
                                                            required
                                                            onChange={this.handleEmail}
                                                            value={this.state.parent1EmailVerify}
                                                        />
                                                    </div>
                                                    <p className="formText">Parent 2</p>
                                                    <div className="smallBox">
                                                        <Input
                                                            className="field half first"
                                                            text="Parent or Guardian's Name"
                                                            type="text"
                                                            name="parent2Name"
                                                            placeholder="Optional"
                                                            onChange={this.handleChange}
                                                            value={this.state.parent2Name}
                                                        />
                                                        <Input
                                                            className="field half"
                                                            text="Parent or Guardian's Phone Number"
                                                            type="tel"
                                                            name="parent2Phone"
                                                            placeholder="Optional"
                                                            onChange={this.handleTelephoneNumber}
                                                            value={this.state.parent2Phone}
                                                        />
                                                        <Input
                                                            className="field half"
                                                            text="Parent or Guardian's Email"
                                                            type="email"
                                                            name="parent2Email"
                                                            placeholder="Optional"
                                                            onChange={this.handleEmail}
                                                            value={this.state.parent2Email}
                                                        />
                                                    </div>
                                                    <div className="field">
                                                        <label htmlFor="address">Address</label>
                                                        <textarea name="address" rows="4"
                                                            placeholder="Required"
                                                            required
                                                            onChange={this.handleChange}
                                                            value={this.state.address}
                                                        ></textarea>
                                                    </div>
                                                </div>
                                                <div>
                                                    <button
                                                        className="button"
                                                        id="previousPage1"
                                                        onClick={this.handleNext}
                                                    >
                                                        Previous
                                                </button>
                                                    <button
                                                        className="button nextPage"
                                                        id="submitPage2"
                                                        onClick={this.handleNext}
                                                    >
                                                        Next
                                                </button>
                                                </div>
                                            </div>
                                            <div className={`${this.state.page === 5 ? 'hide' : ''} ${this.state.page === 3 || this.state.page === 5 ? '' : 'displayNone'}`}>
                                                <h2>Total Amount Due To Reserve Selected Weeks: ${this.state.amountDue}</h2>
                                                <p className='errorMessage'>{this.state.error3}</p>
                                                <h2>Emergency Information</h2>
                                                <div className="infoBox">
                                                    <div className="smallBox">
                                                        <p className="infoText">List two other contacts who will assume temporary care of your child if you cannot be reached</p>
                                                        <p className="formText">Contact 1</p>
                                                        <Input
                                                            className="field half first"
                                                            text="Contact's Name"
                                                            type="text"
                                                            name="emergency1Name"
                                                            placeholder="Required"
                                                            required
                                                            onChange={this.handleChange}
                                                            value={this.state.emergency1Name}
                                                        />
                                                        <Input
                                                            className="field half"
                                                            text="Contact's Phone Number"
                                                            type="tel"
                                                            name="emergency1Phone"
                                                            placeholder="Required"
                                                            required
                                                            onChange={this.handleTelephoneNumber}
                                                            value={this.state.emergency1Phone}
                                                        />
                                                        <Input
                                                            className="field half"
                                                            text="Contact's Relationship"
                                                            type="text"
                                                            name="emergency1Relationship"
                                                            placeholder="Required"
                                                            required
                                                            onChange={this.handleChange}
                                                            value={this.state.emergency1Relationship}
                                                        />
                                                    </div>
                                                    <p className="formText">Contact 2</p>
                                                    <div className="smallBox">
                                                        <div style={{ height: '5px' }} />
                                                        <Input
                                                            className="field half first"
                                                            text="Contact's Name"
                                                            type="text"
                                                            name="emergency2Name"
                                                            placeholder="Required"
                                                            required
                                                            onChange={this.handleChange}
                                                            value={this.state.emergency2Name}
                                                        />
                                                        <Input
                                                            className="field half"
                                                            text="Contact's Phone Number"
                                                            type="tel"
                                                            name="emergency2Phone"
                                                            placeholder="Required"
                                                            required
                                                            onChange={this.handleTelephoneNumber}
                                                            value={this.state.emergency2Phone}
                                                        />
                                                        <Input
                                                            className="field half"
                                                            text="Contact's Relationship"
                                                            type="text"
                                                            name="emergency2Relationship"
                                                            placeholder="Required"
                                                            required
                                                            onChange={this.handleChange}
                                                            value={this.state.emergency2Relationship}

                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    className="button"
                                                    id="previousPage2"
                                                    onClick={this.handleNext}
                                                >Previous</button>

                                                <button
                                                    className="button nextPage"
                                                    id="submitPage3"
                                                    onClick={this.handleNext}
                                                >Next</button>
                                            </div>
                                            <div className={`${this.state.page === 5 ? 'hide' : ''} ${this.state.page === 4 || this.state.page === 5 ? '' : 'displayNone'}`}>
                                                <h2>Total Amount Due To Reserve Selected Weeks: ${this.state.amountDue}</h2>
                                                <p className='errorMessage'>{this.state.error4}</p>
                                                <h2>Physician and Dentist Information</h2>

                                                <div className="infoBox">

                                                    <Input
                                                        className="field half first"
                                                        text="Physician's Name"
                                                        type="text"
                                                        name="physicianName"
                                                        placeholder="Required"
                                                        required
                                                        onChange={this.handleChange}
                                                        value={this.state.physicianName}
                                                    />

                                                    <Input
                                                        className="field half"
                                                        text="Physician's Number"
                                                        type="tel"
                                                        name="physicianPhone"
                                                        placeholder="Required"
                                                        required
                                                        onChange={this.handleTelephoneNumber}
                                                        value={this.state.physicianPhone}
                                                    />

                                                    <Input
                                                        className="field half first"
                                                        text="Dentist's Name"
                                                        type="text"
                                                        name="dentistName"
                                                        placeholder="Required"
                                                        required
                                                        onChange={this.handleChange}
                                                        value={this.state.dentistName}
                                                    />

                                                    <Input
                                                        className="field half"
                                                        text="Dentists's Number"
                                                        type="tel"
                                                        name="dentistPhone"
                                                        placeholder="Required"
                                                        required
                                                        onChange={this.handleTelephoneNumber}
                                                        value={this.state.dentistPhone}
                                                    />

                                                </div>
                                                <button
                                                    className="button"
                                                    id="previousPage3"
                                                    onClick={this.handleNext}
                                                >Previous</button>

                                                <button
                                                    className="button nextPage"
                                                    id="submitPage4"
                                                    onClick={this.handleSubmit}
                                                >Next</button>
                                            </div>
                                            <div className={this.state.page === 5 ? 'main' : 'displayNone'}>
                                                <h2>Total Amount Due To Reserve Selected Weeks: ${this.state.amountDue}</h2>
                                                <h3>Total Remaining After Payment: ${this.state.totalCost - this.state.amountDue}</h3>
                                                <h2>{paymentMethodMessage}</h2>
                                                <h4>Payment Method</h4>
                                                <Checkbox
                                                    name='paypal'
                                                    value='paypal'
                                                    onChange={() => this.handlePaymentMethod('paypal')}
                                                    checked={this.state.paymentMethod === "paypal"}
                                                    onClick={() => this.handlePaymentMethod('paypal')}
                                                    text="Pay By Paypal"
                                                />
                                                <Checkbox
                                                    name='mail'
                                                    value='mail'
                                                    onChange={() => this.handlePaymentMethod('mail')}
                                                    checked={this.state.paymentMethod === 'mail'}
                                                    onClick={() => this.handlePaymentMethod('mail')}
                                                    text="Pay By Mail"
                                                />
                                                <button
                                                    className="button"
                                                    id="previousPage4"
                                                >
                                                    Previous
                                            </button>
                                                <button
                                                    className="nextPage"
                                                    disabled={!this.state.paymentMethod}
                                                    type="submit"
                                                >Submit</button>
                                            </div>
                                        </div>
                                    </form>
                                </section>
                            </div>
                        </div>
                    </div>
                )
        )
    }
}



export default Application;
