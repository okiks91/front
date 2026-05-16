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
                    <p>The Equipment and Facility Monitoring System delivers a polished, efficient, and highly organized approach to managing classroom spaces and equipment. With its seamless reservation process, real-time availability tracking, and intuitive interface, the system elevates resource management into a smooth and reliable experience, ensuring every user enjoys convenience, clarity, and complete confidence in every reservation.</p>
                </div>
            </header>

            <main className="home-content">
                <section className="system-function">
                    <h1>Functions of the System</h1>
                    <p>The system’s core functionality focuses on streamlining the reservation, tracking, and management of equipment and facilities within the Westmead International School.</p>

                    <div className="function">
                        <div className="function-col">
                            <h3>Equipment Monitoring</h3>
                            <p>The equipment monitoring component ensures a seamless and highly organized process by allowing users to view availability, reserve items, and track usage with ease. Through its intuitive interface and real-time updates, it delivers a convenient and efficient way to manage resources while maintaining order and accountability.</p>
                        </div>
                        <div className="function-col">
                            <h3>Facilities Monitoring</h3>
                            <p>The facilities monitoring feature offers a refined and effortless way to oversee classroom availability and usage. With real-time updates and a streamlined reservation process, it ensures that classrooms are organized, accessible, and efficiently managed, providing a smooth and convenient experience for all users.</p>
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