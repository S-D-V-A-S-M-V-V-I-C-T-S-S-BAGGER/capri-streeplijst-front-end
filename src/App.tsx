import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

import classes from './App.module.scss';

const REMOTE = `${window.location.origin}/api`;

function App() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [persons, setPersons] = useState<string[] | null>(null);
  const [items, setItems] = useState<string[] | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(window.localStorage.getItem('user'));

  // Update all information
  const update = () => {
    fetch(`${REMOTE}/`).then(res => res.json()).then(balance => setBalance(balance));
    fetch(`${REMOTE}/persons`).then(res => res.json()).then(persons => setPersons(persons));
    fetch(`${REMOTE}/items`).then(res => res.json()).then(items => setItems(items));
  };

  // Load all data when the app boots
  useEffect(() => update(), []);

  // Hide splash screen if app has loaded
  useEffect(() => {
    if (balance === null || persons === null || items === null) return;

    // @ts-ignore
    document.getElementById('splash').style.opacity = 0;
  }, [balance, persons, items]);

  // Don't render app if the data (or back-end) is not available
  if (balance === null || persons === null || items === null) return <p>Loading...</p>;

  return (
    <div className={classes.root}>
      <div className={classes.balance}>
        <table>
          <thead>
            <tr>
              <th />
              {items.map(item => <th key={item}>{item}</th>)}
              <th>Subtotaal</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(balance).map(person => (
              <tr key={person}>
                <td>{person}</td>
                {items.map(item => <td key={item}>{balance[person][item] ? balance[person][item] : 0}</td>)}
                <td>{Object.keys(balance[person]).map(item => balance[person][item]).reduce((a, b) => a + b, 0)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td />
              {items.map(item => (
                <td key={item}>
                  {Object.keys(balance)
                    .map(person => balance[person][item] ? balance[person][item] : 0)
                    .reduce((a, b) => a + b, 0)}
                </td>
              ))}
              <td />
            </tr>
          </tfoot>
        </table>
        <span>Positief = krediet, negatief = debit</span>
      </div>

      <div className={classes.buttons}>
        {items.map(item => (
          <button key={item} onClick={() => setSelected(item)}>
            {item}
            <span>
              {Object.keys(balance)
                .map(person => balance[person][item] ? balance[person][item] : 0)
                .reduce((a, b) => a + b, 0)} beschikbaar
            </span>
          </button>
        ))}
        <button onClick={() => {
          let name = window.prompt('Item');
          if (name === null) return;

          setItems([...items, name]);
          setSelected(name);
        }}>
          +
          <span>Voeg iets nieuws toe</span>
        </button>
      </div>

      <div className={clsx(classes.checkout, { [classes.active]: selected !== null })}>
        <h4>{selected}</h4>

        <div>
          <label>Wie?</label>
          <ul>
            {persons.map(person => (
              <li
                key={person}
                className={clsx({ [classes.active]: active === person })}
                onClick={() => setActive(person)}
              >
                {person}
              </li>
            ))}
            <li onClick={() => {
              let name = window.prompt('Naam');
              if (name === null) return;

              setPersons([...persons, name]);
              setActive(name);
            }}>
              Nieuw...
            </li>
          </ul>
        </div>

        <div>
          <label>Hoeveel?</label>
          <input id="amount" type="number" name="amount" defaultValue={1} />
          <caption>
            Vul een negatief aantal in als je {selected !== null ? selected.toLowerCase() : ''} hebt gekocht om krediet te
            krijgen.
          </caption>
        </div>

        <div className={classes.actions}>
          <button onClick={() => {
            // @ts-ignore
            document.getElementById("amount").value = 1;
            setSelected(null);
          }}>
            Annuleren
          </button>
          <button onClick={() => {
            // @ts-ignore
            let amount = -parseInt(document.getElementById("amount").value);
            fetch(`${REMOTE}/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                who: active,
                what: selected,
                amount: amount
              })
            }).then(
              res => {
                if (!res.ok) alert("Strepen mislukt, probeer later opnieuw");
                else update()
              },
              () => alert("Strepen mislukt, probeer later opnieuw")
            );
            if (active !== null) window.localStorage.setItem('user', active);
            setSelected(null);
          }}>
            Streep
          </button>
        </div>
      </div>

      <div className={classes.backdrop}  onClick={() => {
        // @ts-ignore
        document.getElementById("amount").value = 1;
        setSelected(null);
      }} />
    </div>
  );
}

type Balance = { [key: string]: { [key: string]: number } };

export default App;
