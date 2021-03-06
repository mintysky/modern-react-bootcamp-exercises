import React, { Component } from 'react';
import axios from 'axios';
import JokeList from './JokeList';
import Header from './Header';
import './DadJokes.css';

export default class DadJokes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jokes: []
    };
    this.generate = this.generate.bind(this);
    this.rate = this.rate.bind(this);
  }

  componentDidMount() {
    const local = localStorage.getItem('DadJokes');
    if (local) this.setState({ jokes: JSON.parse(local) });
    else this.generate();
  }

  rate(idx, diff) {
    let jokes = this.state.jokes.map(j => (j.id === idx ? { ...j, rating: j.rating + diff } : j));
    jokes = jokes.sort((a, b) => b.rating - a.rating);
    this.setState({ jokes });
    localStorage.setItem('DadJokes', JSON.stringify(jokes));
  }

  generate() {
    let jokes = [];
    this.setState({ jokes: [] }, () => {
      const retrieveRecursive = async () => {
        const { data } = await axios.get('https://icanhazdadjoke.com/', { headers: { Accept: 'application/json' } }).catch(console.error);
        const { status, joke, id } = data;
        if (status === 200) {
          if (!jokes.some(j => j.id === id)) jokes.push({ joke, id, rating: 0 });
          if (jokes.length >= 10) {
            jokes = jokes.sort((a, b) => b.rating - a.rating);
            this.setState({ jokes });
            localStorage.setItem('DadJokes', JSON.stringify(jokes));
          } else retrieveRecursive();
        } else console.error('Failed to retrieve joke');
      };
      retrieveRecursive();
    });
  }

  render() {
    return (
      <div className="DadJokes">
        <Header generate={this.generate} enabled={this.state.jokes.length} />
        <JokeList jokes={this.state.jokes} rate={this.rate} />
      </div>
    );
  }
}
