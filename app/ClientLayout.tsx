'use client';

import React from 'react';
import { GlobalStyle } from './styles/global';
import { Header, Container, Title, Footer, GitHubLink, HeaderContent } from './styles/components';
import StyledComponentsRegistry from './registry';
import { FaGithub } from 'react-icons/fa';
import ErrorBoundary from './components/ErrorBoundary';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <StyledComponentsRegistry>
            <ErrorBoundary>
                <GlobalStyle />
                <Header>
                    <Container>
                        <HeaderContent>
                            <Title>TUF Repository Viewer</Title>
                            <GitHubLink
                                href="https://github.com/DeshDeepakKant/TUF-Metadata-Visualizer"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="View source code on GitHub"
                            >
                                <FaGithub />
                            </GitHubLink>
                        </HeaderContent>
                    </Container>
                </Header>
                <Container>
                    {children}
                </Container>
                <Footer>
                    <Container>
                        <p>Powered by Next.js and TUF</p>
                    </Container>
                </Footer>
            </ErrorBoundary>
        </StyledComponentsRegistry>
    );
}