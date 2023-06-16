import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { getDatabase, child, ref, set, get } from 'firebase/database';
import { isWebUri } from 'valid-url';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const Form = () => {
  const [state, setState] = useState({
    longURL: '',
    preferredAlias: '',
    generatedURL: '',
    loading: false,
    errors: [],
    errorMessages: {},
    toolTipMessage: 'Copy To Clipboard',
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    setState((prevState) => ({
      ...prevState,
      loading: true,
      generatedURL: '',
    }));

    console.log('BEFORE validateInput');
    var isFormValid = await validateInput();
    console.log('AFTER validateInput ' + isFormValid);
    if (!isFormValid) {
      return;
    }
    var generatedKey;
    if (state.preferredAlias !== '') {
      generatedKey = state.preferredAlias;
    } else {
      generatedKey = nanoid(5);
    }
    // linkmuncher.dev is for Rs. 860 a year.
    var generatedURL = 'linkmuncher.dev/' + generatedKey;

    const db = getDatabase();
    set(ref(db, '/' + generatedKey), {
      generatedKey: generatedKey,
      longURL: state.longURL,
      preferredAlias: state.preferredAlias,
      generatedURL: generatedURL,
    })
      .then((result) => {
        setState((prevState) => ({
          ...prevState,
          loading: false,
          generatedURL: generatedURL,
        }));
      })
      .catch((e) => {
        // Handle Error
      });
  };

  const hasError = (key) => {
    return state.errors.indexOf(key) !== -1;
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    setState((prevState) => ({
      ...prevState,
      loading: false,
      [id]: value,
    }));
  };

  const validateInput = async () => {
    var errors = [];
    var errorMessages = {};

    validateLongURL(errors, errorMessages);

    const keyExists = await checkKeyExists();
    validatePreferredAlias(errors, errorMessages, keyExists);

    setState((prevState) => ({
      ...prevState,
      errors: errors,
      errorMessages: errorMessages,
    }));

    return errors.length === 0;
  };

  const validateLongURL = (errors, errorMessages) => {
    if (state.longURL.length === 0) {
      errors.push('longURL');
      errorMessages['longURL'] = 'Please enter a URL!';
    } else if (!isWebUri(state.longURL)) {
      errors.push('longURL');
      errorMessages['longURL'] =
        'Please enter a URL in the format https://www...!';
    }
  };

  const validatePreferredAlias = (errors, errorMessages, keyExists) => {
    if (state.preferredAlias.length > 7) {
      errors.push('preferredAlias');
      errorMessages['preferredAlias'] =
        'Please enter an Alias of less than 7 characters';
    } else if (state.preferredAlias.indexOf(' ') >= 0) {
      errors.push('preferredAlias');
      errorMessages['preferredAlias'] = 'Spaces are not allowed in URLs.';
    }

    if (keyExists && keyExists.exists()) {
      errors.push('preferredAlias');
      errorMessages['preferredAlias'] =
        'The Alias you have entered already exists! Please enter another one.';
    }
  };

  const checkKeyExists = async () => {
    const dbRef = ref(getDatabase());
    return get(child(dbRef, `/${state.preferredAlias}`)).catch((error) => {
      return false;
    });
  };

  const copyToClipBoard = () => {
    navigator.clipboard.writeText(state.generatedURL);
    setState((prevState) => ({
      ...prevState,
      toolTipMessage: 'Copied!',
    }));
  };

  return (
    <div className="container">
      <form autoComplete="off">
        <h3>Link Muncher!</h3>
        <div className="form-group">
          <label>Enter Your Long URL!</label>
          <div className="input-group mb-3">
            <input
              id="longURL"
              onChange={handleChange}
              value={state.longURL}
              type="url"
              required
              className={
                hasError('longURL') ? 'form-control is-invalid' : 'form-control'
              }
              placeholder="https://www..."
            />
          </div>
          <div
            className={hasError('longURL') ? 'text-danger' : 'visually-hidden'}
          >
            {state.errorMessages.longURL}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="basic-url">Your Mini URL</label>
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text">linkmuncher.dev/</span>
            </div>
            <input
              id="preferredAlias"
              onChange={handleChange}
              value={state.preferredAlias}
              type="text"
              className={
                hasError('preferredAlias')
                  ? 'form-control is-invalid'
                  : 'form-control'
              }
              placeholder="eg. munch (Optional)"
            />
          </div>
          <div
            className={
              hasError('preferredAlias') ? 'text-danger' : 'visually-hidden'
            }
          >
            {state.errorMessages.preferredAlias}
          </div>
        </div>

        <button className="btn btn-primary" type="button" onClick={onSubmit}>
          {state.loading ? (
            <div>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            </div>
          ) : (
            <div>
              <span
                className="visually-hidden spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              <span>Munch!</span>
            </div>
          )}
        </button>

        {state.generatedURL === '' ? (
          <div></div>
        ) : (
          <div className="generatedurl">
            <span>Your generated URL is: </span>
            <div className="input-group mb-3">
              <input
                disabled
                type="text"
                value={state.generatedURL}
                className="form-control"
                placeholder="Recipient's username"
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
              />
              <div className="input-group-append">
                <OverlayTrigger
                  key={'top'}
                  placement={'top'}
                  overlay={
                    <Tooltip id={`tooltip-${'top'}`}>
                      {state.toolTipMessage}
                    </Tooltip>
                  }
                >
                  <button
                    onClick={() => copyToClipBoard()}
                    data-toggle="tooltip"
                    data-placement="top"
                    title="Tooltip on top"
                    className="btn btn-outline-secondary"
                    type="button"
                  >
                    Copy
                  </button>
                </OverlayTrigger>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Form;
