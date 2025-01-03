import { useMantineColorScheme } from '@mantine/core';

export function LogoColumn () {
  const {colorScheme} = useMantineColorScheme();
  const color = colorScheme &&  colorScheme == 'dark' ?  '#FFFFFF' : '#00215b'; 
  return (
    <div>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fillRule="evenodd"
            strokeLinejoin="round"
            strokeMiterlimit="2"
            clipRule="evenodd"
            width="100%"
            height="100%"
            viewBox="0 0 396 148"
        >
            <path fill="none" d="M0 0H396V148H0z"></path>
            <path
            fill="#ed1c24"
            fillRule="nonzero"
            d="M172.8 32.492c0 5.206.015 9.325-.008 13.443-.008 1.495.088 3.028-.205 4.474-.568 2.799-2.664 4.365-5.319 4.269-2.618-.095-4.504-1.855-4.93-4.689-.123-.816-.071-1.66-.072-2.492-.006-8.153-.04-16.306.004-24.459.027-5.034 1.789-6.877 6.93-6.889 23.295-.053 46.59-.02 69.885-.017.499 0 1.001-.016 1.496.035 2.47.256 4.602 1.123 5.299 3.756.657 2.478-.126 4.513-2.214 6.143-11.798 9.215-23.529 18.517-35.353 27.701-3.404 2.644-4.805 2.557-8.445-.253-7.373-5.693-14.662-11.495-21.996-17.239-1.384-1.083-2.817-2.104-5.072-3.783M236.015 71.584c0-4.503-.004-8.129.002-11.755.003-1.665-.068-3.338.061-4.995.264-3.402 1.897-5.062 4.872-5.131 3.163-.072 4.895 1.697 5.165 5.355.085 1.16.029 2.331.046 3.497.084 5.658.167 11.317.258 16.975.067 4.164-1.805 6.35-5.865 6.351-23.986.003-47.972-.065-71.958-.119-.83-.002-1.699.031-2.482-.19-2.321-.656-3.72-2.24-3.783-4.67-.069-2.64 1.221-4.516 3.883-5.025 1.618-.31 3.314-.28 4.974-.281 19.323-.018 38.646-.012 57.97-.012h6.857"
            ></path>
            <path
            fill="#ed1c24"
            fillRule="nonzero"
            d="M186.694 20.511a4.392 4.392 0 01-4.392 4.392H154.42a4.392 4.392 0 110-8.784h27.882a4.392 4.392 0 014.392 4.392M154.558 76.558c0 2.585-1.693 4.68-3.781 4.68h-24.001c-2.088 0-3.781-2.095-3.781-4.68 0-2.585 1.693-4.68 3.781-4.68h24.001c2.088 0 3.781 2.095 3.781 4.68M168.361 35.903a4.392 4.392 0 01-4.392 4.392h-27.882a4.392 4.392 0 110-8.784h27.882a4.392 4.392 0 014.392 4.392M172.361 50.702c0 2.426-2.807 4.392-6.269 4.392h-39.795c-3.463 0-6.269-1.966-6.269-4.392s2.806-4.392 6.269-4.392h39.795c3.462 0 6.269 1.966 6.269 4.392"
            ></path>
            <g
            fontFamily="'LucidaGrande-Bold', 'Lucida Grande', sans-serif"
            fontSize="52.852"
            fontWeight="600"
            >
            <text
                x="274.421"
                y="322.791"
                fill={color}
                transform="translate(-264 -192)"
            >
                B
                <tspan
                x="306.6px 340.199px 356.275px 388.61px 435.473px 465.434px 481.51px 497.586px 527.443px"
                y="322.791px 322.791px 322.791px 322.791px 322.791px 322.791px 322.791px 322.791px 322.791px"
                >
                ulkMailer
                </tspan>
            </text>
            <text
                x="550.358"
                y="322.791"
                fill="#ed1c24"
                transform="translate(-264 -192)"
            >
                .
                <tspan
                x="562.305px 596.213px 619.128px"
                y="322.791px 322.791px 322.791px"
                >
                pro
                </tspan>
            </text>
            </g>
        </svg>
    </div>
  );
}
