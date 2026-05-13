import React from 'react';


import Navbar from '../../../components/navbar.jsx';
import MemberCardWrapper from '../../../components/navbarRoutes/about/memberCardWrapper.jsx';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faYoutube, faFacebook } from "@fortawesome/free-brands-svg-icons";
import '../../../styles/navbarRoutes/about/about.css';


function About(){
    
    return(
        <>
            <Navbar/>
            
            <header className='home-header'>
                <div className='header-textbox'>
                    <h1>Equipment and Facilities Monitoring</h1>
                    <p>System Short Description</p>
                </div>
            </header>

            <main className="home-content">
                <section className="system-function">
                    <h1>Functions of the System</h1>
                    <p>short introductory sentence</p>

                    <div className="function">
                        <div className="function-col">
                            <h3>Equipment Monitoring</h3>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus illum officia corrupti cupiditate exercitationem veniam quibusdam excepturi, fugit aperiam consequatur corporis ad voluptas accusantium, at iusto tenetur, perferendis rerum sint?</p>
                        </div>
                        <div className="function-col">
                            <h3>Facilities Monitoring</h3>
                            <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Suscipit architecto alias fugit ab ea provident minus, quod ducimus, hic iusto earum? Exercitationem perspiciatis nostrum a cum porro expedita, natus dicta?</p>
                        </div>
                    </div>
                </section>

                <section className="project-team">
                    <h1 className="team-title">PROJECT TEAM</h1>

                    <MemberCardWrapper/>
                </section>
            </main>

            <footer className='home-footer'>
                <h4>About WIS</h4>
                <p>Westmead International School is a multilevel school located in Megaheights Subdivision, Alangilan, Batangas City, Philippines that offers primary and secondary educations, college undergraduate degrees and as well as technical-vocational courses.</p>
                <div className='icons-footer'>
                    <a href='https://www.youtube.com/@westmeadinternationalschoo8922' target='_blank'><FontAwesomeIcon className="icons" icon={faYoutube}/></a>
                    <a href='https://www.facebook.com/westmead.official' target='_blank'><FontAwesomeIcon className="icons" icon={faFacebook}/></a>
                </div> 
            </footer>
        </>
    );
}

export default About