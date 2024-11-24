import { css } from '@/utils/syntactic-sugar'

export const createStyle = () => {
  const styleElement = document.createElement('style')
  styleElement.innerHTML = styles
  document.head.appendChild(styleElement)
}

export const styles = css`
  .sticky-wrapper {
    display: flex;
    justify-content: center;
    position: sticky;
    top: 0px;
    z-index: 99999;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);

    mask: linear-gradient(to bottom, black 80%, transparent);
    -webkit-mask: linear-gradient(to bottom, black 80%, transparent);

    padding: 10px 20px 30px;
  }

  .sticky-wrapper,
  .sticky-wrapper * {
    box-sizing: border-box;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      'Open Sans',
      'Helvetica Neue',
      sans-serif !important;
  }

  .wtk-swagger-search {
    display: flex;
    width: 100%;
    max-width: 1420px !important;
    position: relative;
    border-radius: 10px;
    overflow: hidden;

    box-shadow:
      0 3px 8px -2px rgba(0, 0, 0, 0.1),
      0 1px 3px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;

    background-color: rgba(255, 255, 255, 0.9);
  }

  .wtk-swagger-search-input-wrapper {
    position: relative;
    display: flex;
    flex: 1;
  }

  .wtk-swagger-search-input {
    box-shadow: none !important;
    outline: none !important;
    border-radius: 0px !important;
    border: none !important;
    background: transparent !important;
    height: 60px !important;
    margin: 0 !important;
    box-sizing: border-box !important;
    flex: 1 !important;
    /* padding: 0 20px !important; */
    padding-left: 60px !important;
    font-size: 24px !important;
    font-weight: 500 !important;
    transition:
      border 0.2s ease,
      box-shadow 0.2s ease !important;
    z-index: 0 !important;
  }

  .wtk-swagger-search-input::placeholder {
    color: #b1b1b1 !important;
  }

  .wtk-swagger-search-result {
    position: absolute;
    top: 50%;
    font-size: 20px !important;
    color: #bfbfbf !important;
    transform: translateY(-50%);
    /* height: 20px; */
    /* width: 30px; */
    right: 20px;
    z-index: 2;

    user-select: none !important;
  }

  .wtk-swagger-search-options {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 5px;

    background-color: transparent !important;

    border-right: 1px solid #e0e0e0;

    padding: 0 16px;

    cursor: default;
    user-select: none;
  }

  .wtk-swagger-search-option-item {
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 14px;
    font-weight: 500;
    line-height: 1;
    color: #163647;

    width: 100%;
    height: 30px !important;
    padding: 0 12px !important;
    border-radius: 6px !important;

    transition: background-color 200ms ease;
  }

  .wtk-swagger-search-option-item:hover {
    background-color: #f0f0f0;
  }

  .wtk-swagger-search-option-item.wtk-selected {
    background-color: #85ea2c;
  }

  .wtk-swagger-search-magnifying-glass {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 22px;
    pointer-events: none;
    z-index: 2;
  }

  .wtk-highlight {
    color: #000000;
    background: #febb78;
  }

  .wtk-no-result {
    text-align: center;
  }
`
