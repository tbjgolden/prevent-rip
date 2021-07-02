import Head from 'next/head'
import { useMemo, useState } from 'react'

const numberRegex = /^(\d*)(?:\.(\d{0,2}))?$/

const format = (n) => {
  if (n >= 5) {
    return n.toFixed(0)
  } else if (n >= 1) {
    return `${parseFloat(n.toFixed(1))}`
  } else {
    const str = n.toPrecision(1)
    if (str.includes('e')) {
      const [a, b] = str.split('e')
      return `${parseFloat(a) * Math.pow(10, parseInt(b, 10))}`
    } else {
      return str
    }
  }
}
const factorial = (n) =>
  [
    1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600,
    6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000,
    6402373705728000,
  ][n] || Infinity
const poisson = (lambda, n) =>
  (Math.pow(Math.E, -lambda) * Math.pow(lambda, n)) / factorial(n)

// taken from latest data from givewell.org
const currentUsdPerLifeSaved = 4106
const currentUsdNetPrice = 2

const formatters = {
  USD: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }),
  EUR: new Intl.NumberFormat('en-DK', {
    style: 'currency',
    currency: 'EUR',
  }),
  GBP: new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }),
}

export const Home = (): JSX.Element => {
  const [currency, setCurrency] = useState<'USD' | 'GBP' | 'EUR'>('USD')
  const [value, setValue] = useState('')
  const number = useMemo(
    () => parseFloat(parseFloat(`0${value || '100'}`).toFixed(2)),
    [value]
  )
  const formatted = useMemo(
    () => formatters[currency].format(number),
    [number, currency]
  )
  const usdEquiv = useMemo(
    () =>
      number *
      {
        USD: 1,
        EUR: 1.18,
        GBP: 1.37,
      }[currency],
    [number, currency]
  )
  const numberOfNets = usdEquiv / currentUsdNetPrice
  const probabilityLifeSaved = useMemo(
    () =>
      1 -
      poisson(numberOfNets / (currentUsdPerLifeSaved / currentUsdNetPrice), 0),
    [numberOfNets]
  )

  return (
    <div>
      <Head>
        <title>prevent.rip</title>
      </Head>

      <main>
        <div>
          <h1>
            prevent<span style={{ color: '#f00' }}>.rip</span>
          </h1>
          <p>For a single donation of</p>
          <label>
            <div className="currencies">
              {(['USD', 'EUR', 'GBP'] as const).map((curr) => (
                <button
                  key={curr}
                  className={`currency ${curr === currency ? 'active' : ''}`}
                  onClick={() => {
                    setCurrency(curr)
                  }}
                >
                  {curr}
                </button>
              ))}
            </div>
            <input
              placeholder="100"
              type="tel"
              value={value}
              style={{
                width: `calc(${
                  value.includes('.') ? 0.75 : 1.25
                }em + ${Math.max(3, value.length)}ch)`,
              }}
              onChange={(ev) => {
                const newValue = ev.target.value
                if (numberRegex.test(newValue)) {
                  setValue(newValue)
                }
              }}
              autoFocus
            />
          </label>
          <p>
            <small>{formatted}</small>
          </p>
          <p>
            you{"'"}d pay for {format(usdEquiv / currentUsdNetPrice)}{' '}
            insecticide treated bed net
            {format(usdEquiv / currentUsdNetPrice) === '1' ? '' : 's'},
            which would protect approximately {Math.round(usdEquiv * 1.8 / currentUsdNetPrice)} people
            from malaria for 3 to 5 years
          </p>
          {usdEquiv >= currentUsdPerLifeSaved ? (
            <p>
              you would save (on average){' '}
              {format(usdEquiv / currentUsdPerLifeSaved)}{' '}
              {format(usdEquiv / currentUsdPerLifeSaved) === '1'
                ? "person's life"
                : "people's lives"}
              <br />
              <small>
                there{"'"}d be a {format(probabilityLifeSaved * 100)}% chance your
                donation would save a life
              </small>
            </p>
          ) : (
            <p>
              there{"'"}d be a {format(probabilityLifeSaved * 100)}% chance your
              donation would save a life
              <br />
              <small>
                you would save (on average){' '}
                {format(usdEquiv / currentUsdPerLifeSaved)}{' '}
                {format(usdEquiv / currentUsdPerLifeSaved) === '1'
                  ? "person's life"
                  : "people's lives"}
              </small>
            </p>
          )}
          <a href={
            ({
              "USD": "https://www.paypal.com/us/fundraiser/charity/113632",
              "EUR": "https://www.againstmalaria.com/donate.aspx",
              "GBP": "https://www.paypal.com/gb/fundraiser/charity/3181936"
            })[currency]
          }>
            <button className="donate">Donate and save lives</button>
          </a>
        </div>
      </main>

      <style jsx>{`
        main {
          max-width: 40ch;
          padding: 32px;
          margin: 0 auto;
          text-align: center;
        }

        h1 {
          font-size: 1.5em;
        }
        input {
          padding: 0.25em 0.25em 0.25em 1em;
          font-size: 4em;
          max-width: 100%;
          width: 3.5em;
          background: #111;
        }
        label {
          position: relative;
          display: inline-block;
        }
        small {
          font-size: 80%;
          color: #999;
        }
        .currencies {
          position: absolute;
          top: 1.75em;
          left: 1.5em;
          z-index: 2;
        }
        .currency {
          display: block;
          width: 100%;
          font-size: 1em;
          text-align: center;
          color: #888;
        }
        .currency.active {
          color: #fff;
        }
        p {
          margin: 16px 0;
        }
        a {
          display: inline-block;
          outline: 2px solid #f00;
        }
        a:hover,
        a:focus {
          outline-color: #0f0;
        }
        button {
          cursor: pointer;
        }
        .currency:not(.active):hover {
          color: #ccc;
        }
        .donate {
          padding: 1em;
        }
        ::-webkit-input-placeholder {
          line-height: 5em;
        }
      `}</style>

      <style jsx global>{`
        html,
        body,
        div,
        span,
        applet,
        object,
        iframe,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        p,
        blockquote,
        pre,
        a,
        abbr,
        acronym,
        address,
        big,
        cite,
        code,
        del,
        dfn,
        em,
        img,
        ins,
        kbd,
        q,
        s,
        samp,
        small,
        strike,
        strong,
        sub,
        sup,
        tt,
        var,
        b,
        u,
        i,
        center,
        dl,
        dt,
        dd,
        ol,
        ul,
        li,
        fieldset,
        form,
        label,
        legend,
        table,
        caption,
        tbody,
        tfoot,
        thead,
        tr,
        th,
        td,
        article,
        aside,
        canvas,
        details,
        embed,
        figure,
        figcaption,
        footer,
        header,
        hgroup,
        menu,
        nav,
        output,
        ruby,
        section,
        summary,
        time,
        mark,
        audio,
        video,
        button,
        input {
          margin: 0;
          padding: 0;
          border: 0;
          background: transparent;
          font-size: 100%;
          font: inherit;
          color: inherit;
          vertical-align: baseline;
        }
        article,
        aside,
        details,
        figcaption,
        figure,
        footer,
        header,
        hgroup,
        menu,
        nav,
        section {
          display: block;
        }
        html {
          font-size: 16px;
          line-height: 1.35;
          font-family: 'Inter', sans-serif;
          background: #000;
          color: #fff;
        }
        @media (min-width: 600px) {
          html {
            font-size: 18px;
          }
        }
        @media (min-width: 800px) {
          html {
            font-size: 20px;
          }
        }
        ol,
        ul {
          list-style: none;
        }
        blockquote,
        q {
          quotes: none;
        }
        blockquote:before,
        blockquote:after,
        q:before,
        q:after {
          content: '';
          content: none;
        }
        table {
          border-collapse: collapse;
          border-spacing: 0;
        }
        * {
          box-sizing: border-box;
        }
        @font-face {
          font-family: Inter;
          src: url('/Inter-Medium.woff2') format('woff2');
        }
      `}</style>
    </div>
  )
}

export default Home
